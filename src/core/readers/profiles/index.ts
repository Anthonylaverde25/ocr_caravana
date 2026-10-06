import { ReaderProfile, validateProfile } from '../ReaderProfile';
import genericNus from './generic_nus.json';
import gallagherLike from './gallagher_like.json';
import trutestLike from './trutest_like.json';
import allflexLike from './allflex_like.json';

export const READER_PROFILES: ReaderProfile[] = [genericNus, gallagherLike, trutestLike, allflexLike].map(validateProfile);

export function findProfile(code: string): ReaderProfile | undefined {
  return READER_PROFILES.find((p) => p.code === code);
}
