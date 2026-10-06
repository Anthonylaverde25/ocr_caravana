/**
 * A scanned work-template sheet as the app reviews it, whatever the template: pages read by the AI
 * agent, each with a header and rows of named cells, edited by a person before they are sent.
 * Invariant: pure TypeScript, no react-native, expo, axios or MMKV.
 */

/** One cell of a row as `POST /work-templates/identify` returns it. */
export interface IdentifyCell {
  value?: unknown;
  confidence?: number;
}

/** The body of `POST /work-templates/identify`. */
export interface IdentifyResponse {
  status?: string;
  message?: string;
  identified_template?: { code?: string; title?: string; category?: string } | null;
  context?: Record<string, unknown>;
  data?: { mapped_rows?: Record<string, IdentifyCell | undefined>[] }[];
}

/** Cell values by field key, always as text: what was read or typed, never invented. */
export type SheetValues = Record<string, string>;

export interface SheetRow {
  id: string;
  pageKey: string;
  /** The page it was read on ("Hoja N"), or null for a row added by hand. */
  pageNumber: number | null;
  values: SheetValues;
}

export interface SheetPage {
  key: string;
  fileName: string;
  /** "Hoja N de M", when it was read. */
  hojaNumero: number | null;
  hojaTotal: number | null;
  header: SheetValues;
  rows: SheetRow[];
}

/** How a field is shown and edited. */
export interface FieldSpec {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'choice';
  /** For `choice`: the values offered, and how they read. */
  options?: { value: string; label: string }[];
  /** Typed in upper case (tags, codes, sex letters). */
  upper?: boolean;
  placeholder?: string;
}

/**
 * Everything the app needs to know about one template. The rules are not here: the server
 * decides, and the review asks it with a dry run before saving.
 */
export interface SheetModule {
  code: string;
  title: string;
  /** The endpoint that registers the sheet. */
  endpoint: string;
  headerFields: FieldSpec[];
  rowFields: FieldSpec[];
  /** The field that names a row (the mother, the calf, the caravan). */
  rowTitleKey: string;
  /** Pages of the same document share this value (the order code); another value is another document. */
  documentKey: (header: SheetValues) => string;
  /** Whether a page can belong to several "Hoja N de M". */
  multiPage: boolean;
  readHeader: (context: Record<string, unknown>) => SheetValues;
  readRow: (cells: Record<string, IdentifyCell | undefined>) => SheetValues;
  /** A row nobody wrote on is not a row of the sheet. */
  isWritten: (values: SheetValues) => boolean;
  toPayload: (header: SheetValues, rows: SheetRow[]) => Record<string, unknown>;
  /**
   * A record of the system the sheet names (its order, by the code on the paper), fetched before
   * checking it: the endpoint wants its id. `path` is null when the paper names none; `apply` adds
   * what was found (null when it does not exist: the server then says so).
   */
  lookup?: {
    path: (header: SheetValues) => string | null;
    apply: (payload: Record<string, unknown>, found: Record<string, unknown> | null) => Record<string, unknown>;
  };
  /** What the success screen says, from the `data` of a 2xx answer. */
  summarize: (data: Record<string, unknown>) => string[];
}
