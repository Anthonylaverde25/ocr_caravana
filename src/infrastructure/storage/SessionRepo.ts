import { MMKV } from 'react-native-mmkv';
import { RegistrationSession } from '../../core/entities/RegistrationSession';

const storage = new MMKV({ id: 'reader-sessions' });
const INDEX_KEY = 'session_ids';
const key = (id: string) => `session:${id}`;

/**
 * One key per session, written after every reading: a phone that dies in the chute
 * loses at most the reading in flight.
 */
export const SessionRepo = {
  save(session: RegistrationSession): void {
    storage.set(key(session.id), JSON.stringify(session));
    const ids = SessionRepo.ids();
    if (!ids.includes(session.id)) {
      storage.set(INDEX_KEY, JSON.stringify([session.id, ...ids]));
    }
  },

  find(id: string): RegistrationSession | null {
    const raw = storage.getString(key(id));
    return raw ? (JSON.parse(raw) as RegistrationSession) : null;
  },

  ids(): string[] {
    const raw = storage.getString(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  },

  /** The session the operator left half done, if any, so it can be resumed. */
  findUnfinished(companyId: number): RegistrationSession | null {
    for (const id of SessionRepo.ids()) {
      const session = SessionRepo.find(id);
      if (session && session.companyId === companyId && session.status !== 'submitted') {
        return session;
      }
    }
    return null;
  },

  remove(id: string): void {
    storage.delete(key(id));
    storage.set(INDEX_KEY, JSON.stringify(SessionRepo.ids().filter((x) => x !== id)));
  },
};
