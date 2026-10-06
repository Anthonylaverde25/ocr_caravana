/**
 * What the server said about a sheet — on a dry run or for real — in one shape, whatever the
 * endpoint: errors and warnings of the sheet, errors and warnings of each row by its index in the
 * rows sent. Invariant: pure TypeScript.
 */

export interface ReviewIssue {
  code: string;
  message: string;
  field?: string;
}

export interface ReviewFeedback {
  /** 2xx: the sheet goes through (or went through). */
  ok: boolean;
  message: string | null;
  headerErrors: ReviewIssue[];
  rowErrors: Record<number, ReviewIssue[]>;
  headerWarnings: ReviewIssue[];
  rowWarnings: Record<number, ReviewIssue[]>;
  /** The `data` (or the whole body) of a 2xx answer, for the summary. */
  data: Record<string, unknown>;
}

type Raw = Record<string, unknown>;

const asList = (value: unknown): Raw[] => (Array.isArray(value) ? (value.filter((v) => v && typeof v === 'object') as Raw[]) : []);

const issue = (raw: Raw): ReviewIssue => ({
  code: String(raw.code ?? ''),
  message: String(raw.message ?? ''),
  ...(raw.field ? { field: String(raw.field) } : {}),
});

const push = (target: Record<number, ReviewIssue[]>, row: number, item: ReviewIssue) => {
  target[row] = [...(target[row] ?? []), item];
};

const rowOf = (raw: Raw): number | null => {
  const value = raw.row_index ?? raw.row;

  return typeof value === 'number' ? value : null;
};

/**
 * Laravel answers sheets in two shapes. Row errors grouped by row (`row_index` + `errors[]`: PAR-01,
 * DEST-01, CACT-01, LSER-01) or flat (`row` + `code`: the entry orders). Warnings come in `data.warnings`
 * or at the top, with `row_index`, `row` or none. A plain 422 brings only `message` and maybe the
 * validation `errors` of Laravel.
 */
export function feedbackFromResponse(status: number, body: unknown): ReviewFeedback {
  const raw: Raw = body && typeof body === 'object' ? (body as Raw) : {};
  const data: Raw = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? (raw.data as Raw) : raw;
  const feedback: ReviewFeedback = {
    ok: status >= 200 && status < 300,
    message: typeof raw.message === 'string' ? raw.message : null,
    headerErrors: asList(raw.header_errors).map(issue),
    rowErrors: {},
    headerWarnings: [],
    rowWarnings: {},
    data,
  };

  asList(raw.row_errors).forEach((entry) => {
    const row = rowOf(entry);
    const nested = asList(entry.errors);

    if (row === null) {
      feedback.headerErrors.push(issue(entry));
    } else if (nested.length > 0) {
      nested.forEach((e) => push(feedback.rowErrors, row, issue(e)));
    } else {
      push(feedback.rowErrors, row, issue(entry));
    }
  });

  // Laravel's own validation (422 without our shapes): one message per field.
  if (raw.errors && typeof raw.errors === 'object' && !Array.isArray(raw.errors)) {
    Object.entries(raw.errors as Record<string, unknown>).forEach(([field, messages]) => {
      const first = Array.isArray(messages) ? String(messages[0] ?? '') : String(messages);
      const match = field.match(/^(?:rows|animals|caravans)\.(\d+)\.(.+)$/);

      if (match) push(feedback.rowErrors, Number(match[1]), { code: 'INVALID', message: first, field: match[2] });
      else if (field !== 'domain') feedback.headerErrors.push({ code: 'INVALID', message: first, field });
    });
  }

  if (!feedback.ok && feedback.headerErrors.length === 0 && Object.keys(feedback.rowErrors).length === 0 && feedback.message) {
    feedback.headerErrors.push({ code: String(raw.code ?? 'ERROR'), message: feedback.message });
  }

  [...asList(data.warnings), ...(data !== raw ? asList(raw.warnings) : [])].forEach((entry) => {
    const row = rowOf(entry);

    if (row === null) feedback.headerWarnings.push(issue(entry));
    else push(feedback.rowWarnings, row, issue(entry));
  });

  return feedback;
}

export const errorCount = (feedback: ReviewFeedback): number =>
  feedback.headerErrors.length + Object.values(feedback.rowErrors).reduce((sum, list) => sum + list.length, 0);
