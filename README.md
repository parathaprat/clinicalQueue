# ClinicalQ: No-show outreach queue

This is a production-minded Next.js 14 (App Router) UI for care coordinators: a focus-first call queue, a virtualized ranked roster, rule-based priority (no ML/LLM APIs), keyboard shortcuts, and CSV roster import. Built for low latency on both the bundled demo dataset and potential larger CSV datasets.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## Scoring & logic

All priority is deterministic and auditable in `lib/scoring.ts`. LLM APIs/ ML Models are not used, I came to the design decision that it would be better to create a robust scoring criteria over making expensive API calls, since these would exponentially affect costs and latency when dealing with larger datasets.

**Reference date**: “Today” is the user’s local calendar date in the browser (`new Date()`), used to compute days until appointment.

**Tiers** (evaluated after a missed guard):

| Order | Tier       | When it applies                                                                  |
| ----: | ---------- | -------------------------------------------------------------------------------- |
|     — | **Missed** | Appointment date is before today → deprioritized (numeric score 0, sorted last). |
|     1 | **High**   | ≥3 prior no-shows, or appointment >14 days away and >10 miles from care.         |
|     2 | **Medium** | Not high, and ≥1 prior no-show or appointment >7 days away.                      |
|     3 | **Low**    | All other upcoming patients.                                                     |

**Within-tier ordering**: A 0–100 helper score (no-shows, distance, lead time, small bump for same-day) breaks ties only inside the same tier. It is not a clinical risk model, rather a priority model for no show risk.

**Final sort**: Tier order and within-tier urgency are packed into a single integer **`sortMetric`** (lower = call sooner). The roster is sorted with **`rankPatients()`**: one scoring pass per row, then **O(n log n)** sort on `sortMetric` (and stable tie on `id`).

**Working queue vs roster**: The Outreach queue follows a mutable order (skip moves a patient to the back) while contacted state is tracked separately. The Ranked roster always reflects the global sort of the current dataset.

**Implementation map**: Declarative tier rules: `TIER_RULES_IN_ORDER`. Explanations for the card copy: `lib/explanations.ts`. CSV → rows: `lib/csvImport.ts`.

---

## Assumptions

- **No backend**: Data is static or imported CSV; persistence is **`localStorage`** (contacted IDs, shift goal, optional saved roster).
- **Rules are illustrative**: Thresholds (e.g. 3 no-shows, 7/14 days, 10 miles) stand in for policy agreed with operations/clinical stakeholders; they are not validated outcomes research.
- **CSV import replaces the roster**: Successful import resets contacted state to avoid IDs pointing at removed rows; undo stack for contacts is session-oriented after load.
- **Identifiers**: `id` is assumed unique in the file; duplicates are rejected at import.
- **Insurance** is display-only for context; it does not affect scoring.

---

## What I’d improve with more time

- **Backend + auth**: Real roster API, role-based access, audit logs, and no PHI in `localStorage` unless explicitly designed (encryption, short TTL, org policy).
- **Configurable rules**: Admin UI or config service for thresholds and weights, with versioning and “preview impact” before publish.
- **Quality & accessibility**: Full keyboard paths on every control, screen-reader pass, focus management, and automated E2E tests for queue + import flows.
- **Performance at extreme scale**: Optional Web Worker sort, or bucket/radix on `sortMetric` for very large _n_; debounced search/filter on the virtual list.
- **Product depth**: Disposition reasons, callbacks/snooze, per-coordinator queues, and analytics (contact rates by tier).
- **Optional ML (clearly labeled)**: Separate, opt-in model with documentation and calibration; keep rule-based as the default explainable baseline.

---

## Run locally

**Requirements:** Node.js 18+ (or 20+ recommended), npm.

```bash
cd clinicalQ   # project root
npm install
npm run dev
```

Open **http://localhost:3000** in the browser.

**Other commands:**

```bash
npm run build   # production build
npm run start   # run production server (after build)
npm run lint
```

**CSV sample**: `public/sample-roster.csv` matches the bundled mock data; required columns and aliases are documented in `lib/csvImport.ts`.

---

## Live deployment

**Production URL:** https://clinical-queue.vercel.app/

---

## Standout features

### Product & workflow

- **Dual workspace**: Outreach queue (one patient at a time) vs Ranked roster (full list). Sidebar navigation with clear hierarchy and active states.
- **Transparent priority**: Declarative tier rules in `lib/scoring.ts` plus a packed **`sortMetric`** for efficient ordering and future scale (cheap comparisons; documented path to bucket/radix for extreme batch sizes).
- **Operational metrics**: High risk remaining, outstanding count, configurable shift goal (personal target, not a cap on data), session progress with a premium header treatment.
- **Persistence**: Contacted IDs and shift goal in `localStorage`; optional persisted roster after CSV import (`STORAGE_KEY_ROSTER`). `Reset to demo` restores bundled mock data.

### Interaction & speed

- **Keyboard shortcuts** (disabled while typing in inputs / import drop zone):

  | Key                   | Action                                          |
  | --------------------- | ----------------------------------------------- |
  | **Enter**             | Mark current patient contacted (Outreach queue) |
  | **S**                 | Skip — move to back of working queue            |
  | **U**                 | Undo last contact                               |
  | **?** (Shift + **/**) | Open shortcuts reference                        |
  | **Esc**               | Close shortcuts dialog                          |

- **Sonner toasts** for import success/failure, reset confirmation, and storage-quota warnings.

### Data & scale

- **CSV import**: Drag-and-drop or file picker; Papa Parse for robust parsing; flexible headers (e.g. `appt_date`, `prior_no_shows`, `distance_miles`). Row-level validation with clear error lines.
- **Virtualized roster**: `@tanstack/react-virtual` so the ranked list stays responsive with large row counts (only visible rows mount).
- **Single dataset boundary**: `lib/patientDataset.ts` / `getSeedPatients()` for the mock roster; swap for API or ETL without touching UI logic.

### Craft / UI

- **Typography**: Plus Jakarta Sans (UI) + Outfit (display / headlines) via `next/font`.
- **Visual design**: Deep navy sidebar, ambient gradients, glass-style header, refined cards and shadows, aimed at a modern clinical-ops SaaS aesthetic rather than a default template look.

## Note (demo scope)

This app supports operational triage only. It is not clinical decision support, benefit determination, or a regulated medical device. Deploying with real patient data requires organizational compliance (e.g. BAA, HIPAA) and appropriate technical controls.
