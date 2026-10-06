import { ReaderProfile, formatLine } from '../../core/readers/ReaderProfile';
import { DiscoveredReader, ReaderSource, ReaderStatus, Unsubscribe } from '../../core/readers/ReaderSource';

const MOCK_ID = 'mock-reader';
const KNOWN = ['032000000000001', '032000000000004', '032000000000011'];

/**
 * A reader inside the app, for working on the screens without Bluetooth: emits one
 * animal every few seconds in the profile's format, cut in BLE-sized chunks, with an
 * occasional repeat and an occasional tag the seeder already registered.
 */
export class MockReaderSource implements ReaderSource {
  readonly kind = 'mock' as const;

  private readonly chunkListeners = new Set<(chunk: string) => void>();
  private readonly statusListeners = new Set<(status: ReaderStatus) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 100_000 + (Date.now() % 900_000);
  private last: string | null = null;

  constructor(private readonly intervalMs = 2_500) {}

  async scan(profile: ReaderProfile, onFound: (reader: DiscoveredReader) => void): Promise<Unsubscribe> {
    this.emit({ state: 'scanning' });
    const t = setTimeout(() => onFound({ id: MOCK_ID, name: `${profile.advertisedName} (mock)`, rssi: null }), 400);
    return () => clearTimeout(t);
  }

  async connect(_readerId: string, profile: ReaderProfile): Promise<void> {
    await this.disconnect();
    this.emit({ state: 'connected', deviceName: `${profile.advertisedName} (mock)` });
    this.timer = setInterval(() => this.emitReading(profile), this.intervalMs);
  }

  async disconnect(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
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

  private emitReading(profile: ReaderProfile): void {
    const roll = Math.random();
    let eid: string;
    if (roll < 0.15 && this.last) eid = this.last;
    else if (roll < 0.3) eid = KNOWN[Math.floor(Math.random() * KNOWN.length)];
    else eid = `032${String(this.next++).padStart(12, '0')}`;
    this.last = eid;

    const payload = formatLine(profile, eid) + profile.lineTerminator;
    for (let i = 0; i < payload.length; i += profile.chunkSize) {
      const chunk = payload.slice(i, i + profile.chunkSize);
      this.chunkListeners.forEach((l) => l(chunk));
    }
  }

  private emit(status: ReaderStatus): void {
    this.statusListeners.forEach((l) => l(status));
  }
}
