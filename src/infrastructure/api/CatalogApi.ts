import { api, unwrap } from './ApiClient';

export interface BatchOption {
  id: number;
  name: string;
  activity_name: string | null;
}

export interface CategoryOption {
  id: number;
  code: string;
  name: string;
  /** 'M' | 'H' when the category implies the sex (e.g. vaquillona). */
  sex: string | null;
}

export interface BreedOption {
  id: number;
  name: string;
}

export const CatalogApi = {
  async batches(): Promise<BatchOption[]> {
    const { data } = await api.get('/batches', { params: { scope: 'own' } });
    return unwrap<BatchOption>(data);
  },

  async categories(): Promise<CategoryOption[]> {
    const { data } = await api.get('/animal-categories');
    return unwrap<CategoryOption>(data);
  },

  async breeds(): Promise<BreedOption[]> {
    const { data } = await api.get('/breeds');
    return unwrap<BreedOption>(data);
  },
};
