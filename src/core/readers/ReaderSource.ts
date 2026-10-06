import { ReaderProfile } from './ReaderProfile';

export type Unsubscribe = () => void;

export type ReaderStatus =
  | { state: 'idle' }
  | { state: 'scanning' }
  | { state: 'connecting'; deviceName: string }
  | { state: 'connected'; deviceName: string }
  | { state: 'reconnecting'; deviceName: string; attempt: number; reason: string }
  | { state: 'error'; message: string };

export interface DiscoveredReader {
  id: string;
  name: string;
  rssi: number | null;
}

/**
 * Where readings come from. BLE is the first implementation; a Bluetooth Classic (SPP)
 * source for Android would implement this same contract and nothing downstream changes.
 */
export interface ReaderSource {
  readonly kind: 'ble' | 'mock' | 'classic';
  scan(profile: ReaderProfile, onFound: (reader: DiscoveredReader) => void): Promise<Unsubscribe>;
  connect(readerId: string, profile: ReaderProfile): Promise<void>;
  disconnect(): Promise<void>;
  onChunk(listener: (chunk: string) => void): Unsubscribe;
  onStatus(listener: (status: ReaderStatus) => void): Unsubscribe;
}
