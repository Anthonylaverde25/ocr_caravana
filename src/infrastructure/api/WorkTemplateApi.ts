import { api, errorMessage } from './ApiClient';
import { feedbackFromResponse, ReviewFeedback } from '../../core/work-templates/sheet/feedback';
import type { IdentifyResponse } from '../../core/work-templates/sheet/types';
import {
  WorkTemplateScanResult,
  WorkTemplateContext,
  WorkTemplateScanRow,
  WorkTemplateCode,
} from '../../core/work-templates/types';

export interface ProcessResponse {
  status: string;
  message: string;
  data?: any;
}

export class WorkTemplateApi {
  /**
   * Sends a photo of a sheet to `identify` (OCR + AI agent) and returns its answer as it comes: the
   * template detected, the header and the rows read.
   */
  static async identifyRaw(imageUri: string, filename: string, mimeType: string): Promise<IdentifyResponse> {
    const formData = new FormData();
    formData.append('document', { uri: imageUri, name: filename, type: mimeType } as any);

    try {
      const response = await api.post<IdentifyResponse>('/work-templates/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180_000, // OCR + LLM agent execution
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error al identificar la planilla: ${errorMessage(error)}`);
    }
  }

  /**
   * Registers a reviewed sheet on its endpoint, or with `dryRun` only asks the server what would
   * happen (`X-Dry-Run: 1`: it runs everything and rolls it back). A 4xx is an answer about the sheet,
   * not a failure: it comes back as feedback. Only no answer at all, or a 5xx, throws.
   */
  static async submitSheet(endpoint: string, payload: Record<string, unknown>, dryRun: boolean): Promise<ReviewFeedback> {
    try {
      const response = await api.post(endpoint, payload, {
        headers: dryRun ? { 'X-Dry-Run': '1' } : undefined,
        timeout: 60_000,
        validateStatus: (status) => status < 500,
      });

      return feedbackFromResponse(response.status, response.data);
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }

  /** A record the sheet names (its order by code): its body, or null when it does not exist. */
  static async lookup(path: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await api.get(path, { validateStatus: (status) => status < 500 });

      return response.status === 200 && response.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : null;
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }

  /**
   * Uploads a physical worksheet image/photo to the backend OCR + AI extraction endpoint, mapped for
   * the previous screen (ING-01, TOR-01).
   */
  static async identifyDocument(
    imageUri: string,
    filename: string = 'worksheet.jpg',
    mimeType: string = 'image/jpeg'
  ): Promise<WorkTemplateScanResult> {
    return this.toScanResult(await this.identifyRaw(imageUri, filename, mimeType), imageUri, filename);
  }

  /** An `identify` answer mapped for the previous screen (ING-01, TOR-01). */
  static toScanResult(resData: any, imageUri: string, filename: string): WorkTemplateScanResult {
    try {
      const identifiedTemplate = resData.identified_template || {};
      const context: WorkTemplateContext = resData.context || {};
      const tables = resData.data || [];
      const detectedCode: WorkTemplateCode = (identifiedTemplate.code || 'ING-01').toUpperCase();

      // Extract rows from the first table's mapped_rows
      const rawRows = tables[0]?.mapped_rows || [];
      const mappedRows: WorkTemplateScanRow[] = rawRows.map((r: any, idx: number) => {
        const id = `scan-row-${idx + 1}`;
        const confidence =
          r.caravana?.confidence ??
          r.identification?.confidence ??
          0.95;

        // Specific fields depending on template
        if (detectedCode === 'TOR-01') {
          const scrapeVal = r.scrape_collected?.value;
          const scrapeTaken =
            scrapeVal === true ||
            String(scrapeVal).toUpperCase().includes('SI') ||
            String(scrapeVal).toUpperCase().includes('X') ||
            Boolean(r.scrape_tube?.value);

          const seroVal = r.serology_collected?.value;
          const seroTaken =
            seroVal === true ||
            String(seroVal).toUpperCase().includes('SI') ||
            String(seroVal).toUpperCase().includes('X') ||
            Boolean(r.serology_tube?.value);

          return {
            id,
            caravana: String(r.caravana?.value || r.identification?.value || '').trim(),
            ce_cm: r.ce_cm?.value || r.ce?.value || '',
            bcs: r.bcs?.value || r.bcs_score?.value || r.cc?.value || '',
            libido: r.libido?.value || 'MEDIA',
            aplomos: r.aplomos?.value || 'Correctos',
            scrape_collected: scrapeTaken,
            scrape_tube: r.scrape_tube?.value || (scrapeTaken ? `R-${String(idx + 1).padStart(2, '0')}` : ''),
            serology_collected: seroTaken,
            serology_tube: r.serology_tube?.value || (seroTaken ? `S-${String(idx + 1).padStart(2, '0')}` : ''),
            physical_verdict: r.physical_verdict?.value || r.verdict?.value || 'Apto',
            observations: r.observations?.value || '',
            confidence,
          };
        }

        if (detectedCode === 'PAR-01') {
          return {
            id,
            caravana: String(r.caravana?.value || r.caravana_madre?.value || '').trim(),
            calf_caravan: r.calf_caravan?.value || r.caravana_cria?.value || '',
            calf_sex: r.calf_sex?.value || r.sexo?.value || 'M',
            calf_weight: r.calf_weight?.value || r.peso?.value || '',
            calving_date: r.calving_date?.value || r.fecha?.value || '',
            observations: r.observations?.value || '',
            confidence,
          };
        }

        if (detectedCode === 'DEST-01') {
          return {
            id,
            caravana: String(r.caravana?.value || '').trim(),
            caravana_madre: r.caravana_madre?.value || '',
            entry_weight: r.peso?.value || r.weight?.value || '',
            target_batch: r.lote_destino?.value || '',
            observations: r.observations?.value || '',
            confidence,
          };
        }

        // Standard / ING-01 mapping
        return {
          id,
          caravana: String(r.caravana?.value || r.identification?.value || '').trim(),
          category: r.category?.value || '',
          sex: r.sex?.value || 'M',
          breed: r.breed?.value || '',
          teeth: r.teeth?.value ?? '',
          entry_weight: r.entry_weight?.value || r.weight?.value || '',
          observations: r.observations?.value || '',
          confidence,
        };
      }).filter((r: WorkTemplateScanRow) => r.caravana.length > 0);

      return {
        templateCode: detectedCode,
        templateTitle:
          identifiedTemplate.title ||
          (detectedCode === 'TOR-01'
            ? 'Revisación Andrológica de Toros'
            : detectedCode === 'PAR-01'
            ? 'Planilla de Parición'
            : detectedCode === 'DEST-01'
            ? 'Destete de Terneros'
            : detectedCode === 'LSER-01'
            ? 'Conformación de Lote de Servicio'
            : 'Ingreso de Compra Directa'),
        category: identifiedTemplate.category || 'ENTRY',
        suggestedWorkdayCode: resData.suggested_workday_code,
        context,
        rows: mappedRows,
        sourceImageUri: imageUri,
        sourceImageName: filename,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Error al leer la planilla: ${errorMessage(error)}`);
    }
  }

  /**
   * Persists an ING-01 entry submission.
   */
  static async processIng01(
    context: WorkTemplateContext,
    rows: WorkTemplateScanRow[]
  ): Promise<ProcessResponse> {
    const payload = {
      batch_name: context.batch_name || context.lote || 'LOTE INGRESO',
      activity: context.activity_name || null,
      entry_date: context.entry_date || new Date().toISOString().slice(0, 10),
      provider_cuit: context.provider_cuit || null,
      provider_renspa: context.provider_renspa || null,
      guia_dte: context.guia_dte || null,
      caravans: rows
        .filter((r) => r.caravana.trim() !== '')
        .map((r) => ({
          caravana: r.caravana.trim(),
          category: r.category ? r.category.trim() : null,
          sex: r.sex ? r.sex.trim() : null,
          breed: r.breed ? r.breed.trim() : null,
          teeth: r.teeth !== '' && r.teeth !== null && r.teeth !== undefined ? parseInt(String(r.teeth), 10) : null,
          entry_weight:
            r.entry_weight !== '' && r.entry_weight !== null && r.entry_weight !== undefined
              ? parseFloat(String(r.entry_weight))
              : null,
          observations: r.observations ? r.observations.trim() : null,
        })),
    };

    try {
      const response = await api.post('/work-templates/ing-01/process', payload);
      return {
        status: 'success',
        message: response.data?.message || 'Tropa de ingreso procesada con éxito.',
        data: response.data?.data,
      };
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }

  /**
   * Persists a TOR-01 andrology evaluation.
   */
  static async processTor01(
    context: WorkTemplateContext,
    rows: WorkTemplateScanRow[]
  ): Promise<ProcessResponse> {
    const payload = {
      evaluation_date: context.evaluation_date || context.entry_date || new Date().toISOString().slice(0, 10),
      veterinarian_name: context.veterinarian_name || null,
      veterinarian_license: context.veterinarian_license || null,
      sample_round: context.sample_round || 1,
      rows: rows
        .filter((r) => r.caravana.trim() !== '')
        .map((r) => ({
          caravana: r.caravana.trim(),
          ce_cm:
            r.ce_cm !== '' && r.ce_cm !== null && r.ce_cm !== undefined
              ? parseFloat(String(r.ce_cm))
              : null,
          bcs:
            r.bcs !== '' && r.bcs !== null && r.bcs !== undefined
              ? parseFloat(String(r.bcs))
              : null,
          libido: r.libido ? String(r.libido).trim() : null,
          aplomos: r.aplomos ? String(r.aplomos).trim() : null,
          scrape_collected: Boolean(r.scrape_collected),
          scrape_tube: r.scrape_tube ? String(r.scrape_tube).trim() : null,
          serology_collected: Boolean(r.serology_collected),
          serology_tube: r.serology_tube ? String(r.serology_tube).trim() : null,
          physical_verdict: r.physical_verdict ? String(r.physical_verdict).trim() : 'Apto',
          observations: r.observations ? String(r.observations).trim() : null,
        })),
    };

    try {
      const response = await api.post('/work-templates/tor-01/process', payload);
      return {
        status: 'success',
        message: response.data?.message || 'Planilla andrológica procesada con éxito.',
        data: response.data?.data,
      };
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }

  /**
   * Routes the save action to the backend endpoint of its template. Only ING-01 and TOR-01 are
   * saved from the phone; any other sheet (ING-03, PAR-01, DEST-01…) has its own flow and must
   * never fall into ING-01, which would register its caravans as a direct purchase.
   */
  static async processTemplate(
    templateCode: WorkTemplateCode,
    context: WorkTemplateContext,
    rows: WorkTemplateScanRow[]
  ): Promise<ProcessResponse> {
    const code = templateCode.toUpperCase();
    if (code === 'TOR-01') {
      return this.processTor01(context, rows);
    }
    if (code === 'ING-01') {
      return this.processIng01(context, rows);
    }
    throw new Error(
      `La planilla ${code} todavía no se registra desde el teléfono. Registrala desde la web, en "Escanear Planilla (AI)".`
    );
  }
}
