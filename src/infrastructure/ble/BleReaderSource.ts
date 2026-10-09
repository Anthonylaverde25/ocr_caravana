import { decode } from 'base-64';
import { BleError, BleErrorCode, BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { ReaderProfile } from '../../core/readers/ReaderProfile';
import { DiscoveredReader, ReaderSource, ReaderStatus, Unsubscribe } from '../../core/readers/ReaderSource';
import { attemptAfterLoss, reconnectDelayMs } from '../../core/readers/ReconnectPolicy';
import { requestBluetoothPermissions } from './bluetoothPermissions';

const CONNECT_TIMEOUT_MS = 10_000;
const POWER_ON_TIMEOUT_MS = 5_000;

/**
 * Reader source over BLE. Scans for the profile's service, connects to one reader and
 * forwards every notification as text. When the link or the service is lost without the
 * user asking, it keeps reconnecting with backoff until it succeeds or the user disconnects.
 */
export class BleReaderSource implements ReaderSource {
  readonly kind = 'ble' as const;

  private readonly manager = new BleManager();
  private readonly chunkListeners = new Set<(chunk: string) => void>();
  private readonly statusListeners = new Set<(status: ReaderStatus) => void>();

  private target: { id: string; name: string; profile: ReaderProfile } | null = null;
  private monitor: Subscription | null = null;
  private disconnectWatch: Subscription | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private userDisconnected = false;
  /**
   * Bumped on every connection attempt and every loss. Callbacks carry the generation they
   * were registered under and are ignored once it is stale: tearing a subscription down makes
   * ble-plx report it as cancelled, and that echo must not look like a new loss.
   */
  private generation = 0;
  /** A single recovery at a time; a second one would cancel the link the first just made. */
  private recovering = false;
  /** Last reconnection attempt and when the link came up, so a link that keeps dropping backs off. */
  private attempt = 0;
  private connectedAt = 0;

  async scan(profile: ReaderProfile, onFound: (reader: DiscoveredReader) => void): Promise<Unsubscribe> {
    await this.ensureReady();
    this.emit({ state: 'scanning' });
    const seen = new Set<string>();

    await this.manager.startDeviceScan([profile.serviceUuid], { allowDuplicates: false }, async (error, device) => {
      if (error) {
        this.emit({ state: 'error', message: describe(error) });
        return;
      }
      if (device && !seen.has(device.id)) {
        seen.add(device.id);
        onFound({ id: device.id, name: device.localName ?? device.name ?? profile.advertisedName, rssi: device.rssi });
      }
    });

    return () => {
      void this.manager.stopDeviceScan();
    };
  }

  async connect(readerId: string, profile: ReaderProfile): Promise<void> {
    await this.manager.stopDeviceScan();
    this.userDisconnected = false;
    this.recovering = false;
    this.attempt = 0;
    this.clearReconnect();
    this.target = { id: readerId, name: profile.advertisedName, profile };
    this.emit({ state: 'connecting', deviceName: this.target.name });
    try {
      await this.establish();
    } catch (error) {
      // Left as "connecting" the UI would wait forever for a link that is not coming.
      this.emit({ state: 'error', message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.userDisconnected = true;
    this.recovering = false;
    this.generation++;
    this.clearReconnect();
    this.teardownSubscriptions();
    if (this.target) {
      await this.manager.cancelDeviceConnection(this.target.id).catch(() => undefined);
    }
    this.target = null;
    this.emit({ state: 'idle' });
  }

  onChunk(listener: (chunk: string) => void): Unsubscribe {
    this.chunkListeners.add(listener);
    return () => this.chunkListeners.delete(listener);
  }

  onStatus(listener: (status: ReaderStatus) => void): Unsubscribe {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private async establish(): Promise<void> {
    const target = this.target;
    if (!target) return;
    const generation = ++this.generation;
    const stale = () => generation !== this.generation || this.userDisconnected;

    const device = await withTimeout(
      this.manager.connectToDevice(target.id),
      CONNECT_TIMEOUT_MS,
      () => void this.manager.cancelDeviceConnection(target.id).catch(() => undefined),
    );
    if (stale()) return;
    await device.discoverAllServicesAndCharacteristics();
    if (stale()) return;

    // A link is not a reader: without the profile's characteristic no caravan can arrive, and
    // subscribing would fail at once and look like a loss right after "connected".
    if (!(await hasCharacteristic(device, target.profile))) {
      await this.manager.cancelDeviceConnection(target.id).catch(() => undefined);
      throw new Error(`El lector no ofrece el servicio del perfil "${target.profile.displayName}"`);
    }
    if (stale()) return;

    this.target = { ...target, name: device.localName ?? device.name ?? target.name };
    this.watch(device, target.profile, generation);
    this.recovering = false;
    this.connectedAt = Date.now();
    this.emit({ state: 'connected', deviceName: this.target.name });
  }

  private watch(device: Device, profile: ReaderProfile, generation: number): void {
    this.teardownSubscriptions();

    this.disconnectWatch = this.manager.onDeviceDisconnected(device.id, () => {
      if (generation === this.generation) this.handleLoss('El lector se desconectó');
    });

    this.monitor = device.monitorCharacteristicForService(
      profile.serviceUuid,
      profile.notifyCharacteristicUuid,
      (error, characteristic) => {
        if (generation !== this.generation) return;
        if (error) {
          // Our own teardown, and the link drop that onDeviceDisconnected already handles.
          if (error.errorCode === BleErrorCode.OperationCancelled || error.errorCode === BleErrorCode.DeviceDisconnected) {
            return;
          }
          // The reader withdrew its service or stopped answering: recover the same way.
          this.handleLoss(describe(error));
          return;
        }
        if (characteristic?.value) {
          const chunk = decode(characteristic.value);
          this.chunkListeners.forEach((l) => l(chunk));
        }
      },
    );
  }

  private handleLoss(reason: string): void {
    if (this.userDisconnected || !this.target || this.recovering) return;
    this.recovering = true;
    this.generation++;
    this.teardownSubscriptions();
    void this.manager.cancelDeviceConnection(this.target.id).catch(() => undefined);
    this.scheduleReconnect(attemptAfterLoss(this.attempt, Date.now() - this.connectedAt), reason);
  }

  private scheduleReconnect(attempt: number, reason: string): void {
    const target = this.target;
    if (!target || this.userDisconnected) return;

    this.attempt = attempt;
    this.emit({ state: 'reconnecting', deviceName: target.name, attempt, reason });
    const delay = reconnectDelayMs(attempt);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.establish();
      } catch (error) {
        this.scheduleReconnect(attempt + 1, error instanceof Error ? error.message : reason);
      }
    }, delay);
  }

  private async ensureReady(): Promise<void> {
    if (!(await requestBluetoothPermissions())) {
      throw new Error('Sin permiso de Bluetooth. Habilitalo en los ajustes del teléfono.');
    }
    const state = await this.waitForPowerOn();
    if (state === State.Unauthorized) {
      throw new Error('La app no tiene permiso de Bluetooth.');
    }
    if (state !== State.PoweredOn) {
      throw new Error('El Bluetooth del teléfono está apagado.');
    }
  }

  /** Right after start-up the manager reports Unknown for a moment before the real state. */
  private waitForPowerOn(): Promise<State> {
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(async () => finish(await this.manager.state()), POWER_ON_TIMEOUT_MS);
      const subscription = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn || state === State.PoweredOff || state === State.Unauthorized) {
          finish(state);
        }
      }, true);

      function finish(state: State) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        subscription.remove();
        resolve(state);
      }
    });
  }

  private teardownSubscriptions(): void {
    this.monitor?.remove();
    this.monitor = null;
    this.disconnectWatch?.remove();
    this.disconnectWatch = null;
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private emit(status: ReaderStatus): void {
    this.statusListeners.forEach((l) => l(status));
  }
}

async function hasCharacteristic(device: Device, profile: ReaderProfile): Promise<boolean> {
  try {
    const characteristics = await device.characteristicsForService(profile.serviceUuid);
    const wanted = profile.notifyCharacteristicUuid.toLowerCase();
    return characteristics.some((c) => c.uuid.toLowerCase() === wanted);
  } catch {
    // ble-plx rejects when the service itself is missing.
    return false;
  }
}

function describe(error: BleError): string {
  return error.reason ?? error.message;
}

function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout();
      reject(new Error('El lector no respondió a tiempo'));
    }, ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}
