import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReviewFeedback, ReviewIssue } from '../../core/work-templates/sheet/feedback';
import { emptyRow, mergedHeader, missingPages, orderedRows, pageMismatch } from '../../core/work-templates/sheet/pages';
import type { SheetModule, SheetPage, SheetRow, SheetValues } from '../../core/work-templates/sheet/types';
import { WorkTemplateApi } from '../../infrastructure/api/WorkTemplateApi';

/** Time without edits before the sheet is checked again against the server. */
const VALIDATE_AFTER_MS = 900;

export interface RowIssues {
  errors: ReviewIssue[];
  warnings: ReviewIssue[];
}

/**
 * The review of one scanned document, whatever its template: its pages, the header and rows as the
 * person leaves them, and what the server says about them. Every change is checked with a dry run
 * (the real rules, nothing saved) once the person stops editing; "Registrar" sends the same payload
 * for real. Rows nobody wrote on are not sent, and the server's row numbers point into what was sent.
 */
export function useSheetReview(module: SheetModule | null) {
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [header, setHeader] = useState<SheetValues>({});
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [checkedVersion, setCheckedVersion] = useState(-1);
  const [version, setVersion] = useState(0);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<ReviewFeedback | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const manualSeq = useRef(0);
  const lookups = useRef(new Map<string, Record<string, unknown> | null>());

  const touch = () => setVersion((v) => v + 1);

  const sent = useMemo(() => (module ? rows.filter((r) => module.isWritten(r.values)) : []), [module, rows]);
  const payload = useMemo(() => (module ? module.toPayload(header, sent) : {}), [module, header, sent]);

  /** The payload with what the sheet names in the system (its order) resolved; cached per code. */
  const resolvedPayload = useCallback(async (): Promise<Record<string, unknown>> => {
    const path = module?.lookup?.path(header) ?? null;

    if (!module?.lookup || path === null) return module?.lookup ? module.lookup.apply(payload, null) : payload;

    if (!lookups.current.has(path)) lookups.current.set(path, await WorkTemplateApi.lookup(path));

    return module.lookup.apply(payload, lookups.current.get(path) ?? null);
  }, [module, header, payload]);

  const start = useCallback((page: SheetPage) => {
    setPages([page]);
    setRows(orderedRows([page], []));
    setHeader(mergedHeader([page]));
    setFeedback(null);
    setSaved(null);
    setNetworkError(null);
    setCheckedVersion(-1);
    touch();
  }, []);

  /** Another page of the same document; returns why it was refused, or null. */
  const addPage = useCallback(
    (page: SheetPage): string | null => {
      if (!module) return 'No hay una planilla abierta.';

      const problem = pageMismatch(module, pages[0], page);
      if (problem) return problem;

      const next = [...pages, page];
      setPages(next);
      // What was already edited stays as it is; the new page's rows take their place by page number.
      setRows((current) => {
        const read = [...current.filter((r) => r.pageKey !== 'manual'), ...page.rows];
        const order = (r: SheetRow) => r.pageNumber ?? Number.MAX_SAFE_INTEGER;

        return [...read.map((r, i) => ({ r, i })).sort((a, b) => order(a.r) - order(b.r) || a.i - b.i).map(({ r }) => r), ...current.filter((r) => r.pageKey === 'manual')];
      });
      setHeader((current) => ({ ...mergedHeader(next), ...Object.fromEntries(Object.entries(current).filter(([, v]) => v)) }));
      touch();

      return null;
    },
    [module, pages]
  );

  const updateHeader = useCallback((key: string, value: string) => {
    setHeader((current) => ({ ...current, [key]: value }));
    touch();
  }, []);

  const saveRow = useCallback((row: SheetRow) => {
    setRows((current) => (current.some((r) => r.id === row.id) ? current.map((r) => (r.id === row.id ? row : r)) : [...current, row]));
    touch();
  }, []);

  const deleteRow = useCallback((id: string) => {
    setRows((current) => current.filter((r) => r.id !== id));
    touch();
  }, []);

  const newRow = useCallback((): SheetRow | null => {
    if (!module) return null;
    manualSeq.current += 1;

    return emptyRow(module, `manual-${manualSeq.current}`);
  }, [module]);

  const check = useCallback(async () => {
    if (!module || sent.length === 0 || saved) return;

    const at = version;
    setValidating(true);
    setNetworkError(null);

    try {
      const answer = await WorkTemplateApi.submitSheet(module.endpoint, await resolvedPayload(), true);
      setFeedback(answer);
      setCheckedVersion(at);
    } catch (error) {
      setNetworkError(error instanceof Error ? error.message : 'Sin conexión con el sistema');
    } finally {
      setValidating(false);
    }
  }, [module, resolvedPayload, sent.length, saved, version]);

  useEffect(() => {
    if (!module || pages.length === 0 || saved) return;

    const timer = setTimeout(check, VALIDATE_AFTER_MS);

    return () => clearTimeout(timer);
    // Checked again only when something changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, module, pages.length]);

  /** "Registrar": the same payload, for real. A refusal shows like a dry run's. */
  const register = useCallback(async () => {
    if (!module || sent.length === 0) return;

    setSaving(true);
    setNetworkError(null);

    try {
      const answer = await WorkTemplateApi.submitSheet(module.endpoint, await resolvedPayload(), false);
      setFeedback(answer);
      setCheckedVersion(version);

      if (answer.ok) setSaved(answer);
    } catch (error) {
      // No answer: whether it was saved is unknown. It is not retried by itself.
      setNetworkError(error instanceof Error ? error.message : 'Sin conexión con el sistema');
    } finally {
      setSaving(false);
    }
  }, [module, resolvedPayload, sent.length, version]);

  const reset = useCallback(() => {
    lookups.current.clear();
    setPages([]);
    setRows([]);
    setHeader({});
    setFeedback(null);
    setSaved(null);
    setNetworkError(null);
    setCheckedVersion(-1);
  }, []);

  /** Issues of each row, by its id: the server numbers rows by their position among the ones sent. */
  const issuesById = useMemo(() => {
    const byId: Record<string, RowIssues> = {};

    sent.forEach((row, index) => {
      const errors = feedback?.rowErrors[index] ?? [];
      const warnings = feedback?.rowWarnings[index] ?? [];

      if (errors.length || warnings.length) byId[row.id] = { errors, warnings };
    });

    return byId;
  }, [feedback, sent]);

  const current = checkedVersion === version && !validating;

  return {
    pages,
    rows,
    header,
    sentCount: sent.length,
    missingPages: missingPages(pages),
    feedback,
    issuesById,
    /** The last check describes the sheet as it is now. */
    current,
    canRegister: current && feedback?.ok === true && !saving && sent.length > 0,
    validating,
    saving,
    saved,
    networkError,
    start,
    addPage,
    updateHeader,
    saveRow,
    deleteRow,
    newRow,
    check,
    register,
    reset,
  };
}

export type SheetReview = ReturnType<typeof useSheetReview>;
