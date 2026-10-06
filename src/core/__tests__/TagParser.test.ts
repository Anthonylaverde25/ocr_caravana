import { READER_PROFILES, findProfile } from '../readers/profiles';
import { formatLine } from '../readers/ReaderProfile';
import { TagParser } from '../readers/TagParser';

const EID = '032000000100007';

describe('TagParser', () => {
  it.each(READER_PROFILES.map((p) => [p.code, p] as const))(
    'reads back what the %s profile writes',
    (_code, profile) => {
      const line = formatLine(profile, EID, new Date(2026, 8, 24, 10, 31, 5));
      expect(new TagParser(profile).parse(line)).toEqual({ ok: true, eid: EID });
    },
  );

  const gallagher = new TagParser(findProfile('gallagher_like')!);

  it.each([
    ['truncated', '0320000001'],
    ['14 digits', '03200000010000'],
    ['16 digits', '0320000001000077'],
    ['letters', '0320000A0100007'],
    ['garbage', 'ERR'],
  ])('rejects a %s reading and keeps the raw text', (_case, line) => {
    const result = gallagher.parse(line);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.raw).toBe(line);
  });

  it('tolerates surrounding whitespace', () => {
    expect(gallagher.parse('  032000000100007 ')).toEqual({ ok: true, eid: EID });
  });

  it('normalises the separator of the generic profile', () => {
    const nus = new TagParser(findProfile('generic_nus')!);
    expect(nus.parse('982 000123456789')).toEqual({ ok: true, eid: '982000123456789' });
  });

  it('accepts but warns about a country code outside Argentina and manufacturers', () => {
    const result = gallagher.parse('124000000100007');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warning).toMatch(/124/);
  });
});
