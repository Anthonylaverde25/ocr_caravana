import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as S from '../../core/entities/RegistrationSession';
import { LineAssembler } from '../../core/readers/LineAssembler';
import { ReaderProfile } from '../../core/readers/ReaderProfile';
import { ReaderSource, ReaderStatus } from '../../core/readers/ReaderSource';
import { TagParser } from '../../core/readers/TagParser';
import { READER_PROFILES } from '../../core/readers/profiles';
import { isNoAnswer, errorMessage } from '../../infrastructure/api/ApiClient';
import { CaravanRegistrationApi } from '../../infrastructure/api/CaravanRegistrationApi';
import { BleReaderSource } from '../../infrastructure/ble/BleReaderSource';
import { MockReaderSource } from '../../infrastructure/mock/MockReaderSource';
import { AuthSession, AuthStore } from '../../infrastructure/storage/AuthStore';
import { SessionRepo } from '../../infrastructure/storage/SessionRepo';

const VERIFY_EVERY_MS = 4_000;

export type SourceKind = 'ble' | 'mock';

export interface SubmitFeedback {
  tone: 'success' | 'error' | 'warning';
  message: string;
}

interface ReaderContextValue {
  auth: AuthSession | null | undefined;
  signIn(session: AuthSession): Promise<void>;
  signOut(): Promise<void>;
  selectCompany(companyId: number): Promise<void>;

  profile: ReaderProfile;
  setProfile(profile: ReaderProfile): void;
  sourceKind: SourceKind;
  setSourceKind(kind: SourceKind): void;
  source: ReaderSource;
  status: ReaderStatus;

  session: S.RegistrationSession | null;
  startSession(header: S.SessionHeader): void;
  closeSession(): void;
  update(fn: (s: S.RegistrationSession) => S.RegistrationSession): void;

  online: boolean;
  verify(): Promise<void>;
  submit(): Promise<SubmitFeedback>;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function useReader(): ReaderContextValue {
  const value = useContext(ReaderContext);
  if (!value) throw new Error('useReader fuera de ReaderProvider');
  return value;
}

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthSession | null | undefined>(undefined);
  const [profile, setProfile] = useState<ReaderProfile>(READER_PROFILES[1]);
  const [sourceKind, setSourceKind] = useState<SourceKind>('ble');
  const [status, setStatus] = useState<ReaderStatus>({ state: 'idle' });
  const [session, setSession] = useState<S.RegistrationSession | null>(null);
  const [online, setOnline] = useState(true);
  const sessionRef = useRef<S.RegistrationSession | null>(null);
  const verifying = useRef(false);

  // The BLE manager is only created when BLE is actually chosen.
  const sources = useRef<Partial<Record<SourceKind, ReaderSource>>>({});
  const source = useMemo(() => {
    sources.current[sourceKind] ??= sourceKind === 'ble' ? new BleReaderSource() : new MockReaderSource();
    return sources.current[sourceKind]!;
  }, [sourceKind]);

  const update = useCallback((fn: (s: S.RegistrationSession) => S.RegistrationSession) => {
    const current = sessionRef.current;
    if (!current) return;
    const next = fn(current);
    if (next === current) return;
    sessionRef.current = next;
    setSession(next);
    SessionRepo.save(next);
  }, []);

  useEffect(() => {
    AuthStore.get().then((stored) => {
      setAuth(stored);
      if (stored) {
        sessionRef.current = SessionRepo.findUnfinished(stored.company.id);
        setSession(sessionRef.current);
      }
    });
  }, []);

  useEffect(() => source.onStatus(setStatus), [source]);

  // Chunks → complete lines → tags → session. Rebuilt when the reader profile changes.
  useEffect(() => {
    const assembler = new LineAssembler(profile.lineTerminator, (junk) =>
      update((s) => S.recordDiscarded(s, junk.slice(0, 64), 'Datos sin fin de línea', new Date())),
    );
    const parser = new TagParser(profile);
    const offStatus = source.onStatus((st) => { if (st.state === 'connected') assembler.reset(); });

    const offChunk = source.onChunk((chunk) => {
      for (const line of assembler.push(chunk)) {
        const parsed = parser.parse(line);
        if (!parsed.ok) {
          update((s) => S.recordDiscarded(s, parsed.raw, parsed.reason, new Date()));
          continue;
        }
        const current = sessionRef.current;
        if (!current) continue;
        const result = S.recordReading(
          current,
          { eid: parsed.eid, raw: line, source: source.kind, ...(parsed.warning ? { warning: parsed.warning } : {}) },
          new Date(),
        );
        update(() => result.session);
        Vibration.vibrate(result.isNew ? 80 : [0, 30, 60, 30]);
      }
    });

    return () => { offChunk(); offStatus(); };
  }, [profile, source, update]);

  const verify = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || verifying.current || !S.isEditable(current)) return;
    const pending = S.uncheckedEids(current);
    if (pending.length === 0) return;

    verifying.current = true;
    try {
      const results = await CaravanRegistrationApi.lookup(pending);
      update((s) => S.applyLookup(s, results));
      setOnline(true);
    } catch (error) {
      setOnline(!isNoAnswer(error));
    } finally {
      verifying.current = false;
    }
  }, [update]);

  // Readings pile up offline; they are checked against the system whenever it answers.
  useEffect(() => {
    const timer = setInterval(() => void verify(), VERIFY_EVERY_MS);
    return () => clearInterval(timer);
  }, [verify]);

  const submit = useCallback(async (): Promise<SubmitFeedback> => {
    const current = sessionRef.current;
    if (!current) return { tone: 'error', message: 'No hay sesión' };

    const started = S.startSubmission(current, randomUUID);
    update(() => started);

    try {
      const outcome = await CaravanRegistrationApi.registerNew(started.submissionId!, S.buildRegisterRows(started));
      setOnline(true);

      if (outcome.kind === 'registered') {
        update((s) => S.submissionSucceeded(s, outcome.count));
        return { tone: 'success', message: `Se dieron de alta ${outcome.count} animales.` };
      }
      if (outcome.kind === 'conflict') {
        update((s) => S.applyLookup(S.submissionRejected(s), outcome.conflicts));
        return { tone: 'warning', message: 'Algunas caravanas ya estaban registradas. Quedaron marcadas; no se dio de alta ninguna.' };
      }
      update(S.submissionRejected);
      return { tone: 'error', message: outcome.message };
    } catch (error) {
      if (isNoAnswer(error)) {
        setOnline(false);
        update(S.submissionUnanswered);
        return { tone: 'warning', message: 'Sin respuesta del sistema. Reintentá el envío cuando haya conexión: no se duplicará.' };
      }
      update(S.submissionRejected);
      return { tone: 'error', message: errorMessage(error) };
    }
  }, [update]);

  const startSession = useCallback((header: S.SessionHeader) => {
    if (!auth) return;
    const created = S.createSession({ id: randomUUID(), companyId: auth.company.id, profileCode: profile.code, header, now: new Date() });
    sessionRef.current = created;
    setSession(created);
    SessionRepo.save(created);
  }, [auth, profile.code]);

  const closeSession = useCallback(() => {
    const current = sessionRef.current;
    if (current && current.status !== 'submitted') SessionRepo.remove(current.id);
    sessionRef.current = null;
    setSession(null);
  }, []);

  const signIn = useCallback(async (next: AuthSession) => {
    await AuthStore.set(next);
    setAuth(next);
    sessionRef.current = SessionRepo.findUnfinished(next.company.id);
    setSession(sessionRef.current);
  }, []);

  const signOut = useCallback(async () => {
    await source.disconnect();
    await AuthStore.clear();
    sessionRef.current = null;
    setSession(null);
    setAuth(null);
  }, [source]);

  const selectCompany = useCallback(async (companyId: number) => {
    if (!auth) return;
    const company = auth.companies.find((c) => c.id === companyId);
    if (company) await signIn({ ...auth, company });
  }, [auth, signIn]);

  const value: ReaderContextValue = {
    auth, signIn, signOut, selectCompany,
    profile, setProfile, sourceKind, setSourceKind, source, status,
    session, startSession, closeSession, update,
    online, verify, submit,
  };

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}
