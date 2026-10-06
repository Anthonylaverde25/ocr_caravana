/**
 * A chute session registering NEW animals. The header is declared once and every animal
 * inherits it; only what is found out at the chute is asked per animal.
 *
 * Plain serializable state plus pure functions, so the same object is rendered, persisted
 * to MMKV after every reading and unit tested without React Native.
 */

export type Sex = 'M' | 'H';
export type LookupStatus = 'unchecked' | 'not_found' | 'own_company' | 'other_company';
export type SessionStatus = 'open' | 'review' | 'submitting' | 'submitted';
export type ReadingSource = 'ble' | 'mock' | 'classic';

export interface SessionHeader {
  batchId: number;
  batchName: string;
  categoryId: number | null;
  categoryName: string | null;
  subcategoryId: number | null;
  breedId: number | null;
  /** Default for every animal; null means it is asked animal by animal. */
  sex: Sex | null;
  entryDate: string;
  defaultTeeth: number;
}

export interface TagReading {
  eid: string;
  raw: string;
  firstReadAt: string;
  lastReadAt: string;
  readCount: number;
  source: ReadingSource;
  warning?: string;
}

export interface DiscardedReading {
  raw: string;
  reason: string;
  at: string;
}

export interface AnimalOverrides {
  sex?: Sex;
  teeth?: number;
  entryWeight?: number;
}

export interface RegistrationSession {
  id: string;
  companyId: number;
  profileCode: string;
  createdAt: string;
  header: SessionHeader;
  readings: TagReading[];
  discarded: DiscardedReading[];
  lookup: Record<string, LookupStatus>;
  overrides: Record<string, AnimalOverrides>;
  status: SessionStatus;
  /** Fixed on the first attempt; a retry after a lost reply must reuse it. */
  submissionId: string | null;
  /** True while an attempt got no answer: the server may or may not have registered it. */
  submissionPending: boolean;
  registeredCount?: number;
}

export interface ReviewItem {
  eid: string;
  status: LookupStatus;
  readCount: number;
  warning?: string;
  sex: Sex | null;
  teeth: number;
  entryWeight?: number;
  /** Only NEW animals are registered; the rest are shown and left out. */
  willRegister: boolean;
  issues: string[];
}

export interface RegisterRow {
  identification: string;
  sex: Sex;
  teeth: number;
  batch_id: number;
  category_id: number | null;
  subcategory_id: number | null;
  breed_id: number | null;
  entry_date: string;
  entry_weight?: number;
}

export function createSession(params: {
  id: string;
  companyId: number;
  profileCode: string;
  header: SessionHeader;
  now: Date;
}): RegistrationSession {
  return {
    id: params.id,
    companyId: params.companyId,
    profileCode: params.profileCode,
    createdAt: params.now.toISOString(),
    header: params.header,
    readings: [],
    discarded: [],
    lookup: {},
    overrides: {},
    status: 'open',
    submissionId: null,
    submissionPending: false,
  };
}

export function isEditable(session: RegistrationSession): boolean {
  return (session.status === 'open' || session.status === 'review') && !session.submissionPending;
}

/**
 * Records a valid reading. An animal already in the session is the same animal read again
 * (the antenna sees it several times in the chute): it only bumps its counter.
 */
export function recordReading(
  session: RegistrationSession,
  reading: { eid: string; raw: string; source: ReadingSource; warning?: string },
  now: Date,
): { session: RegistrationSession; isNew: boolean } {
  if (session.status !== 'open') {
    return { session, isNew: false };
  }

  const at = now.toISOString();
  const existing = session.readings.find((r) => r.eid === reading.eid);

  if (existing) {
    const readings = session.readings.map((r) =>
      r.eid === reading.eid ? { ...r, readCount: r.readCount + 1, lastReadAt: at } : r,
    );
    return { session: { ...session, readings }, isNew: false };
  }

  const added: TagReading = {
    eid: reading.eid,
    raw: reading.raw,
    firstReadAt: at,
    lastReadAt: at,
    readCount: 1,
    source: reading.source,
    ...(reading.warning ? { warning: reading.warning } : {}),
  };

  return {
    session: {
      ...session,
      readings: [added, ...session.readings],
      lookup: { ...session.lookup, [reading.eid]: 'unchecked' },
    },
    isNew: true,
  };
}

export function recordDiscarded(session: RegistrationSession, raw: string, reason: string, now: Date): RegistrationSession {
  if (session.status !== 'open') {
    return session;
  }
  return { ...session, discarded: [{ raw, reason, at: now.toISOString() }, ...session.discarded] };
}

export function uncheckedEids(session: RegistrationSession): string[] {
  return session.readings.filter((r) => (session.lookup[r.eid] ?? 'unchecked') === 'unchecked').map((r) => r.eid);
}

export function applyLookup(
  session: RegistrationSession,
  results: { identification: string; status: Exclude<LookupStatus, 'unchecked'> }[],
): RegistrationSession {
  const lookup = { ...session.lookup };
  for (const result of results) {
    if (result.identification in lookup) {
      lookup[result.identification] = result.status;
    }
  }
  return { ...session, lookup };
}

export function setOverride(session: RegistrationSession, eid: string, patch: AnimalOverrides): RegistrationSession {
  if (!isEditable(session)) {
    return session;
  }
  return { ...session, overrides: { ...session.overrides, [eid]: { ...session.overrides[eid], ...patch } } };
}

/** The reviewer takes out a reading they know is wrong (e.g. an animal from the next pen). */
export function removeReading(session: RegistrationSession, eid: string): RegistrationSession {
  if (!isEditable(session)) {
    return session;
  }
  const { [eid]: _lookup, ...lookup } = session.lookup;
  const { [eid]: _overrides, ...overrides } = session.overrides;
  return { ...session, readings: session.readings.filter((r) => r.eid !== eid), lookup, overrides };
}

export function setStatus(session: RegistrationSession, status: 'open' | 'review'): RegistrationSession {
  return isEditable(session) ? { ...session, status } : session;
}

export function reviewItems(session: RegistrationSession): ReviewItem[] {
  return session.readings.map((reading) => {
    const status = session.lookup[reading.eid] ?? 'unchecked';
    const own = session.overrides[reading.eid] ?? {};
    const sex = own.sex ?? session.header.sex;
    const teeth = own.teeth ?? session.header.defaultTeeth;
    const willRegister = status === 'not_found';
    const issues: string[] = [];

    if (status === 'unchecked') issues.push('Sin verificar contra el sistema');
    if (willRegister && sex === null) issues.push('Falta el sexo');

    return {
      eid: reading.eid,
      status,
      readCount: reading.readCount,
      ...(reading.warning ? { warning: reading.warning } : {}),
      sex,
      teeth,
      ...(own.entryWeight !== undefined ? { entryWeight: own.entryWeight } : {}),
      willRegister,
      issues,
    };
  });
}

/** Everything that stops the submission, worded for the reviewer. Empty means it can go. */
export function submissionBlockers(session: RegistrationSession): string[] {
  const items = reviewItems(session);
  const blockers: string[] = [];
  const unchecked = items.filter((i) => i.status === 'unchecked').length;
  const missingSex = items.filter((i) => i.willRegister && i.sex === null).length;

  if (unchecked > 0) blockers.push(`${unchecked} caravana(s) sin verificar: hace falta conexión con el sistema`);
  if (missingSex > 0) blockers.push(`${missingSex} animal(es) sin sexo`);
  if (!items.some((i) => i.willRegister)) blockers.push('No hay animales nuevos para dar de alta');

  return blockers;
}

export function buildRegisterRows(session: RegistrationSession): RegisterRow[] {
  const { header } = session;
  return reviewItems(session)
    .filter((i) => i.willRegister && i.sex !== null)
    .map((i) => ({
      identification: i.eid,
      sex: i.sex as Sex,
      teeth: i.teeth,
      batch_id: header.batchId,
      category_id: header.categoryId,
      subcategory_id: header.subcategoryId,
      breed_id: header.breedId,
      entry_date: header.entryDate,
      ...(i.entryWeight !== undefined ? { entry_weight: i.entryWeight } : {}),
    }));
}

export function startSubmission(session: RegistrationSession, newSubmissionId: () => string): RegistrationSession {
  return {
    ...session,
    status: 'submitting',
    submissionId: session.submissionId ?? newSubmissionId(),
    submissionPending: true,
  };
}

export function submissionSucceeded(session: RegistrationSession, registeredCount: number): RegistrationSession {
  return { ...session, status: 'submitted', submissionPending: false, registeredCount };
}

/**
 * The server answered with a refusal (409/422): nothing was written, so the reviewer can
 * edit again and the next attempt is a different submission.
 */
export function submissionRejected(session: RegistrationSession): RegistrationSession {
  return { ...session, status: 'review', submissionPending: false, submissionId: null };
}

/** No answer: the server may have registered it. Stay locked; only a retry is allowed. */
export function submissionUnanswered(session: RegistrationSession): RegistrationSession {
  return { ...session, status: 'review', submissionPending: true };
}
