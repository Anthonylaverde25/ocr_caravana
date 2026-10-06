import { useCallback, useState } from 'react';
import { moduleFor } from '../../core/work-templates/registry';
import { pageFromIdentify } from '../../core/work-templates/sheet/pages';
import type { IdentifyResponse, SheetModule } from '../../core/work-templates/sheet/types';
import { WorkTemplateApi } from '../../infrastructure/api/WorkTemplateApi';
import { useSheetReview } from './useSheetReview';

export interface PickedSheetImage {
  uri: string;
  name: string;
  mimeType: string;
}

/**
 * A scanned sheet of a template with a module, from its first page to its registration: opens the
 * review from an `identify` answer (a photo, the gallery or a simulation) and adds later pages of
 * the same document. A template without a module is left to the previous screen.
 */
export function useSheetScan() {
  const [module, setModule] = useState<SheetModule | null>(null);
  const review = useSheetReview(module);
  const [addingPage, setAddingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  /** Opens the review of the sheet; false when its template has no module. */
  const open = useCallback(
    (response: IdentifyResponse, fileName: string): boolean => {
      const found = moduleFor(response.identified_template?.code ?? '');

      if (!found) return false;

      setModule(found);
      setPageError(null);
      review.start(pageFromIdentify(found, response, fileName));

      return true;
    },
    [review]
  );

  /** Reads another page and adds it if it is of the same template and document. */
  const addPage = useCallback(
    async (image: PickedSheetImage) => {
      if (!module) return;

      setAddingPage(true);
      setPageError(null);

      try {
        const response = await WorkTemplateApi.identifyRaw(image.uri, image.name, image.mimeType);
        const code = (response.identified_template?.code ?? '').toUpperCase();

        if (code !== module.code) {
          setPageError(`Esa hoja no es una ${module.code}${code ? ` (se detectó ${code})` : ''}.`);
          return;
        }

        setPageError(review.addPage(pageFromIdentify(module, response, image.name)));
      } catch (error) {
        setPageError(error instanceof Error ? error.message : 'No se pudo leer la hoja.');
      } finally {
        setAddingPage(false);
      }
    },
    [module, review]
  );

  const close = useCallback(() => {
    review.reset();
    setModule(null);
    setPageError(null);
  }, [review]);

  return { module, review, addingPage, pageError, open, addPage, close };
}
