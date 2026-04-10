import Papa from "papaparse";

import type { Patient } from "@/data/patients";

export type CsvImportOk = {
  ok: true;
  patients: Patient[];
  rowCount: number;
};

export type CsvImportErr = {
  ok: false;
  errors: string[];
};

export type CsvImportResult = CsvImportOk | CsvImportErr;

/** Maps normalized CSV headers → Patient keys */
const HEADER_ALIASES: Record<string, keyof Patient> = {
  id: "id",
  name: "name",
  apptdate: "apptDate",
  appointment: "apptDate",
  appt_date: "apptDate",
  appointmentdate: "apptDate",
  appointment_date: "apptDate",
  date: "apptDate",
  priornoshows: "priorNoShows",
  prior_no_shows: "priorNoShows",
  noshows: "priorNoShows",
  no_shows: "priorNoShows",
  priorappts: "priorAppts",
  prior_appts: "priorAppts",
  appointments: "priorAppts",
  distancemiles: "distanceMiles",
  distance_miles: "distanceMiles",
  distance: "distanceMiles",
  miles: "distanceMiles",
  insurance: "insurance",
  plan: "insurance",
  payor: "insurance",
};

function normHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function patientCsvTemplateHeader(): string {
  return "id,name,apptDate,priorNoShows,priorAppts,distanceMiles,insurance";
}

export function parsePatientCsv(file: File): Promise<CsvImportResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => normHeader(h),
      complete: (results) => {
        const fatal = results.errors.filter((e) => e.type === "Quotes");
        if (fatal.length > 0) {
          resolve({
            ok: false,
            errors: fatal.map(
              (e) => `CSV parse: ${e.message} (row ${e.row ?? "?"})`
            ),
          });
          return;
        }
        resolve(buildPatientsFromRows(results.data as Record<string, string>[]));
      },
      error: (err) => {
        resolve({ ok: false, errors: [err.message || "Could not read file"] });
      },
    });
  });
}

export function parsePatientCsvText(text: string): CsvImportResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => normHeader(h),
  });

  const fatal = parsed.errors.filter((e) => e.type === "Quotes");
  if (fatal.length > 0) {
    return {
      ok: false,
      errors: fatal.map(
        (e) => `CSV parse: ${e.message} (row ${e.row ?? "?"})`
      ),
    };
  }

  return buildPatientsFromRows(parsed.data);
}

function buildPatientsFromRows(rows: Record<string, string>[]): CsvImportResult {
  const errors: string[] = [];

  if (rows.length === 0) {
    return { ok: false, errors: ["No data rows found."] };
  }

  const headerKeys = Object.keys(rows[0] ?? {}).filter((k) => k && k.length > 0);
  const mapped = new Map<string, keyof Patient>();
  for (const k of headerKeys) {
    const canon = HEADER_ALIASES[k];
    if (canon) mapped.set(k, canon);
  }

  const required: (keyof Patient)[] = [
    "id",
    "name",
    "apptDate",
    "priorNoShows",
    "priorAppts",
    "distanceMiles",
    "insurance",
  ];
  const foundFields = new Set(mapped.values());
  for (const f of required) {
    if (!foundFields.has(f)) {
      errors.push(`Missing required column (or alias) for: ${f}`);
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const patients: Patient[] = [];
  const seenIds = new Set<number>();

  rows.forEach((row, i) => {
    const line = i + 2;
    if (!row || Object.keys(row).length === 0) return;
    if (!Object.values(row).some((v) => String(v ?? "").trim() !== "")) return;
    const vals = {} as Record<keyof Patient, string>;
    Array.from(mapped.entries()).forEach(([rawKey, canon]) => {
      const v = row[rawKey];
      if (v !== undefined && v !== null) vals[canon] = String(v).trim();
    });

    const id = Number.parseInt(vals.id, 10);
    if (Number.isNaN(id) || idsNotNatural(id)) {
      errors.push(`Line ${line}: invalid id "${vals.id}"`);
      return;
    }
    if (seenIds.has(id)) {
      errors.push(`Line ${line}: duplicate id ${id}`);
      return;
    }
    seenIds.add(id);

    if (!vals.name) {
      errors.push(`Line ${line}: name required`);
      return;
    }

    if (!isDateString(vals.apptDate)) {
      errors.push(
        `Line ${line}: apptDate must be YYYY-MM-DD (got "${vals.apptDate}")`
      );
      return;
    }

    const priorNoShows = Number.parseInt(vals.priorNoShows, 10);
    const priorAppts = Number.parseInt(vals.priorAppts, 10);
    const distanceMiles = Number.parseInt(vals.distanceMiles, 10);
    if (
      Number.isNaN(priorNoShows) ||
      priorNoShows < 0 ||
      Number.isNaN(priorAppts) ||
      priorAppts < 0 ||
      Number.isNaN(distanceMiles) ||
      distanceMiles < 0
    ) {
      errors.push(`Line ${line}: priorNoShows, priorAppts, distanceMiles must be non‑negative integers`);
      return;
    }

    patients.push({
      id,
      name: vals.name,
      apptDate: vals.apptDate,
      priorNoShows,
      priorAppts,
      distanceMiles,
      insurance: vals.insurance || "Unknown",
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (patients.length === 0) {
    return { ok: false, errors: ["No valid patient rows."] };
  }

  return { ok: true, patients, rowCount: patients.length };
}

function idsNotNatural(id: number): boolean {
  return id < 1 || id > 1_000_000_000;
}
