import {
  RegistrationSession,
  SessionHeader,
  applyLookup,
  buildRegisterRows,
  createSession,
  isEditable,
  recordDiscarded,
  recordReading,
  removeReading,
  setOverride,
  startSubmission,
  submissionBlockers,
  submissionRejected,
  submissionSucceeded,
  submissionUnanswered,
  uncheckedEids,
} from '../entities/RegistrationSession';

const header: SessionHeader = {
  batchId: 12,
  batchName: 'Lote Testing Lector BLE',
  categoryId: 3,
  categoryName: 'Ternero',
  subcategoryId: null,
  breedId: null,
  sex: null,
  entryDate: '2026-09-24',
  defaultTeeth: 0,
};

const now = new Date('2026-09-24T10:00:00Z');

function session(overrides: Partial<SessionHeader> = {}): RegistrationSession {
  return createSession({ id: 's1', companyId: 1, profileCode: 'gallagher_like', header: { ...header, ...overrides }, now });
}

function read(s: RegistrationSession, eid: string) {
  return recordReading(s, { eid, raw: eid, source: 'mock' }, now);
}

describe('RegistrationSession', () => {
  it('counts a repeated animal once and bumps its read counter', () => {
    let s = session();
    s = read(s, '032000000100001').session;
    const again = read(s, '032000000100001');
    expect(again.isNew).toBe(false);
    expect(again.session.readings).toHaveLength(1);
    expect(again.session.readings[0].readCount).toBe(2);
  });

  it('keeps the newest reading first', () => {
    let s = read(session(), '032000000100001').session;
    s = read(s, '032000000100002').session;
    expect(s.readings.map((r) => r.eid)).toEqual(['032000000100002', '032000000100001']);
  });

  it('keeps discarded lines with their raw text', () => {
    const s = recordDiscarded(session(), '0320000', 'truncada', now);
    expect(s.discarded[0]).toMatchObject({ raw: '0320000', reason: 'truncada' });
  });

  it('only registers animals the system does not know', () => {
    let s = session({ sex: 'M' });
    for (const eid of ['032000000100001', '032000000000001', '032000000000011']) s = read(s, eid).session;
    s = applyLookup(s, [
      { identification: '032000000100001', status: 'not_found' },
      { identification: '032000000000001', status: 'own_company' },
      { identification: '032000000000011', status: 'other_company' },
    ]);
    expect(buildRegisterRows(s).map((r) => r.identification)).toEqual(['032000000100001']);
  });

  it('inherits the header and lets the animal override it', () => {
    let s = read(session({ sex: 'H', defaultTeeth: 2 }), '032000000100001').session;
    s = applyLookup(s, [{ identification: '032000000100001', status: 'not_found' }]);
    expect(buildRegisterRows(s)[0]).toMatchObject({ sex: 'H', teeth: 2, batch_id: 12, category_id: 3, entry_date: '2026-09-24' });

    s = setOverride(s, '032000000100001', { sex: 'M', teeth: 4, entryWeight: 182.5 });
    expect(buildRegisterRows(s)[0]).toMatchObject({ sex: 'M', teeth: 4, entry_weight: 182.5 });
  });

  it('blocks the submission while something is unchecked or a sex is missing', () => {
    let s = read(session(), '032000000100001').session;
    expect(uncheckedEids(s)).toEqual(['032000000100001']);
    expect(submissionBlockers(s).join()).toMatch(/sin verificar/);

    s = applyLookup(s, [{ identification: '032000000100001', status: 'not_found' }]);
    expect(submissionBlockers(s).join()).toMatch(/sin sexo/);

    s = setOverride(s, '032000000100001', { sex: 'M' });
    expect(submissionBlockers(s)).toEqual([]);
  });

  it('does not count an existing animal as missing its sex', () => {
    let s = read(session(), '032000000000001').session;
    s = applyLookup(s, [{ identification: '032000000000001', status: 'own_company' }]);
    expect(submissionBlockers(s)).toEqual(['No hay animales nuevos para dar de alta']);
  });

  it('lets the reviewer remove a misread', () => {
    let s = read(session(), '032000000100001').session;
    s = removeReading(s, '032000000100001');
    expect(s.readings).toEqual([]);
    expect(s.lookup).toEqual({});
  });

  describe('submission', () => {
    const ids = ['sub-1', 'sub-2'];
    const nextId = () => ids.shift()!;

    it('reuses the same id after a lost reply and stays locked', () => {
      let s = startSubmission(session(), nextId);
      expect(s.submissionId).toBe('sub-1');
      s = submissionUnanswered(s);
      expect(isEditable(s)).toBe(false);
      expect(setOverride(s, 'x', { sex: 'M' })).toBe(s);
      s = startSubmission(s, nextId);
      expect(s.submissionId).toBe('sub-1');
    });

    it('unlocks and takes a new id after a refusal', () => {
      let s = submissionRejected(startSubmission(session(), () => 'a'));
      expect(isEditable(s)).toBe(true);
      s = startSubmission(s, () => 'b');
      expect(s.submissionId).toBe('b');
    });

    it('stops accepting readings once submitted', () => {
      const s = submissionSucceeded(startSubmission(session(), () => 'a'), 1);
      expect(read(s, '032000000100009').session).toBe(s);
    });
  });
});
