# ریسکورا — Insurance Premium Tools

Two Persian (RTL) underwriting calculators behind one landing page:

| Tool | Route | What it does |
|---|---|---|
| **نرخ‌دهی تمام‌خطر نصب** | `#/ear` | **EAR (Erection All Risks)** rating, reproducing the Swiss Re methodology in `EAR_Rating_v18.xlsx`, localized for Iran: Rial, Standard 2800 seismic classification, NIMA FX |
| **ماشین‌حساب الحاقیه** | `#/endorsement` | Day-counted endorsement premium for capital increase/decrease and policy renewal, on the Jalali calendar |

Both calculation engines are pure TypeScript modules with no UI dependencies.

Routing is **hash-based** (`#/ear`, `#/endorsement`) rather than path-based: it gives deep links
and working back/forward with no router dependency, and needs no SPA rewrite rule on the host —
a path-based router would 404 on a refresh at `/ear`.

---

## Running it

```bash
npm install
npm run dev      # dev server
npm run test     # engine acceptance tests
npm run build    # production build
```

No backend, no database, no auth, no telemetry. Everything runs client-side, and nothing is
persisted — there is deliberately no `localStorage`/`sessionStorage` use, so reloading the page
returns to the default scenario.

### Deploying

`vite build` emits to **`dist/`**. `vercel.json` pins the framework, build command, and output
directory, so a host does not have to infer them — without it, a project preset left on Create
React App looks for a `build/` directory and fails with
`No Output Directory named "build" found`.

The build is a static bundle; any static host works. Routing is hash-based, so no SPA rewrite
rule is needed.

---

## Where the rate data lives

All rate tables are static JSON in **`rate-data/`**, extracted and verified from the workbook:

| File | Contents |
|---|---|
| `subgroups.json` | 151 white-table sub-groups: banded rates, hot-test, reference and minimum rates |
| `machines.json` | 108 blue-table individual machines, keyed by EAR code + description |
| `industry_groups.json` | 19 industry groups → their sub-group names |
| `cities_2800.json` | 489 county-seat points with Standard 2800 hazard levels |
| `earthquake.json` | Tables E1, E2, the 2800→Swiss-Re zone map, and Table E monthly rates |
| `tpl.json` | TPL base rates, limit-adaptation factors, reference minimum premiums |
| `existing_property.json` | Existing-property cover options and their ‰ rates |
| `currency.json` | NIMA rate, inflation factor, and c-unit thresholds |
| `deductibles.json` | Excess rebate tables D.1/D.2/D.3 and the stepped maintenance factor |

`reference/EAR_Rating_v18.xlsx` is kept as documentation only — the Persian labels, the `Data`
sheet notes, and the `Changelog` sheet explaining prior audit revisions. **Nothing reads the
`.xlsx` at runtime.**

Two source defects are normalized in `src/engine/data.ts` rather than by editing the JSON, so
`rate-data/` stays a byte-faithful copy of the verified extract:

- `cities_2800.json` has its `province` and `city` field names transposed — the field named
  `province` holds the city. Verified against the workbook, whose lookup key is
  `City & " — " & Province`.
- The `industry_groups.json` keys are Excel defined-name codes (`EAR_05___Metal_Industry`)
  whose encoding is lossy (`___` means both ` — ` and ` & `). The 19 display labels are mapped
  explicitly instead of being reverse-derived.

### Updating the NIMA rate and inflation factor

Both are editable in the app: the **gear icon** in the header opens the currency panel.

The defaults come from `rate-data/currency.json`:

```json
{ "nimaRate": 1480135, "inflationFactor": 2.07 }
```

`rialPerCUnit = nimaRate × inflationFactor`, and every c-unit threshold (the debris-clearance
trigger, the seven TPL limit bands) converts through that single figure. The seeded NIMA rate is
a mid-Tir-1405 placeholder — **update it before relying on any output**. To change the shipped
default rather than the session value, edit `currency.json`.

---

## Architecture

```
rate-data/                  static JSON rate tables (EAR)
src/routes.ts               hash routing
src/App.tsx                 shell: route resolution + page noise overlay
src/views/
  Landing.tsx               the tool chooser
  EarRating.tsx             the EAR rating tool
  EndorsementApp.tsx        shell around the endorsement calculator
src/engine/                 EAR calculation module — zero UI imports
  types.ts                  domain types
  data.ts                   typed indexes over rate-data
  round.ts                  Excel-compatible half-away-from-zero rounding
  calc.ts                   the engine
  __tests__/                acceptance tests T1-T9 + data integrity guards
src/endorsement/            the imported endorsement calculator, as supplied
  lib/calc/                 its pure day-count premium engine + tests
  components/ scenarios/ pages/
src/components/             shared UI
src/labels.ts               Persian strings, taken from the workbook's own label columns
```

### The endorsement calculator

`src/endorsement/` is the supplied `premium-calculator` source, kept as-is — its engine,
scenarios, components and tests are unmodified. Only two things were added around it:

- `src/views/EndorsementApp.tsx` replaces its own title bar with the shared `AppHeader`, so
  both tools read as one product.
- A **token compatibility layer** in `src/index.css`. The calculator ships its own vocabulary
  (`primary` / `foreground` / `card` / `muted` / …) on a blue-on-navy glass theme; those names
  are aliased onto this project's tokens, so it inherits the monochrome editorial palette
  without its components being rewritten. `.glass` is redefined as a flat bordered panel, and its
  remaining blue accents, gradients and glows were flattened to ink — the design has no accent
  colour. See `DESIGN.md`.

Its A4-landscape print stylesheet is ported too.

The engine is a single pure function:

```ts
calculate(inputs: EarInputs, currency?: CurrencySettings): EarResult
```

It returns the full rate build-up, earthquake detail, add-ons, TPL detail, the premium
waterfall, all seven validation checks, and any non-blocking warnings. The UI only formats what
the engine returns; it performs no arithmetic of its own.

---

## Deductibles / excesses

Two structures are offered, matching Iranian market practice: **a percentage of
each loss subject to a minimum amount**, and **a fixed amount**. Swiss Re's third
structure — expressing the excess as a multiple of the table minimum — is
deliberately not exposed; the excess is always entered in Rial and the engine
derives the multiple from it, which is the same arithmetic by a friendlier route.

The rebate applies to erection, hot testing and the reference-rate loadings. It
never touches the **earthquake loading** (Sec. 3.2.1 allows no excess rebate on
the major-perils rate) nor **riot and strike**, which is an externally sourced
rate.

The table minimum is converted to Rial through a **local-market calibration**
(Sec. 3.2.3), not the general c-unit factor — editable behind the gear icon,
defaulting to 50,000,000 IRR per 1,000 c-units. The c-unit factor still governs
the TPL limit bands and the debris threshold, because 3.2.3 speaks only about
excesses.

On the TPL side the excess deduction comes off the premium **before**
cross-liability, so the 35% surcharge is taken on the reduced figure.

## Two decisions worth knowing about

**1. TPL limit bands are read as upper bounds.** The specification's prose describes a
floor lookup ("highest factor whose threshold ≤ limit"), which would give **1.40** for a
7,000,000 c-unit limit — but acceptance test T9 requires **1.56**. The workbook's own
`Rate-TPL` B.2 table labels its rows `≤ 0.5 mio`, `1 mio`, `2 mio (base)`, `4 mio`, `6 mio`,
`8 mio`, `10 mio`, i.e. band *upper* bounds, so a 7 mio limit takes the 8 mio factor. This is
also the same round-up convention the workbook applies to the earthquake E factor. The engine
implements the ceiling lookup, with the specified `below first band → factor 1` rule that a
zero/blank limit needs.

This deliberately implements the **corrected** bands. The workbook's
`Currency-Conversion!B22`/`B23` contain stray Persian text instead of `6000000` and `8000000`,
which collapses the factor to 1.20 across the 4–10 mio band. `tpl.json` carries the repaired
thresholds.

**2. The default industry group is `12 — Plastic & Rubber`.** The reference scenario names
`05 — Metal Industry` next to sub-group `12.5 Paint factories…`, but 12.5 belongs to group 12 —
the pairing is inherited from the workbook's own stale dropdown value. `industryGroup` only
filters the sub-group picker and never feeds the calculation, so the app defaults to the
coherent group; the reference premium is identical either way, and a test asserts that.

---

## Known gaps — please leave them as gaps

These are **deliberately not implemented**. They are listed here so the next developer does not
helpfully fill them in. Where useful, the reference data is shown in the UI, clearly labelled as
not applied.

1. **Deductible rebates.** `Rate-Deductibles` holds 172 rows in the workbook but is wired into
   nothing. There is no deductible discount. Do not add one.
2. **Large-sum-insured rebate for individual machines.** Swiss Re §2.5 defines factors
   0.95 / 0.925 / 0.90, but the c-unit thresholds are garbled in the OCR source. Not
   implemented, and not to be guessed.
3. **Defective material/workmanship double-count.** In Individual-Machines scope the blue basic
   rate already includes this cover, so the Manufacturer's-Risk loading double-counts it. It is
   left active by instruction; the app raises a **non-blocking warning** when scope is
   Individual Machines and either Manufacturer's-Risk field is above zero.
4. **Average rate across multiple machines.** Swiss Re expects an average rate where several
   machines share one policy. The engine handles **one machine at a time**. Do not build a
   multi-machine aggregator.
5. **Policy-level minimum premium.** Swiss Re mentions one including the MD section, but the
   figure is unreadable in the OCR source. Not implemented.
6. **Mislabelled workbook cells.** `Data!B23` and `Data!D27` carry stray maintenance labels
   belonging to other rows. The correct semantic labels are used here — `Data` row 23 is
   **Existing Property**, not maintenance.

### No minimum premiums anywhere

There is **no minimum-premium floor on MD**. It was removed in workbook revision v15 after an
audit found the referenced cell was the *General Excess* — a deductible — mislabelled as a
minimum premium. Do not reintroduce it.

There is **no TPL minimum premium** in the live calculation. The Swiss Re per-category grid
(500–4000 c-units) is genuine and is retained in `tpl.json` as `minPremiumCU`; the breakdown
panel displays it for reference, explicitly marked as not applied. It must not enter the maths.

Minimum **rate** floors are a different thing and remain active: the Entire-Project effective
erection rate is still `MAX(banded base, sub-group minimum)`. For individual machines the basic
rate *is* simultaneously the minimum rate, which the formula already guarantees.

---

## Acceptance tests

`npm run test` runs the nine acceptance tests from the specification plus data-integrity
guards. The expected values were verified against the workbook by forced recalculation.

**If a test fails, the engine is wrong — fix the engine, never the expected value.**

| # | Scenario | Locks in |
|---|---|---|
| T1 | Entire Project, 15 months | Minimum-rate floor (3.65‰, not 3.025‰) and the full premium chain |
| T2 | T1 with TPL excluded | TPL and cross-liability both zero |
| T3 | Individual Machines, 3 + 1 | Blue basic rate used as-is, no hot-testing rate |
| T4 | Individual Machines, 9 + 3 | Erection/testing extensions at the caps |
| T5 | Erection 24 | Clamping to 9 months, and V7 failing |
| T6 | `02.0.8` vs `05.0.9` | Machine matching by key, not description |
| T7 | Sensitivity 4, structure 6 | E = 20 → Zone C monthly 0.073‰ → 1.095‰ |
| T8 | T4 with nature perils on | The Individual-Machines earthquake gate |
| T9 | TPL limit 7,000,000 c-units | Limit factor 1.56 across all seven bands |

---

## Not in scope

By instruction, this tool has no user accounts, no quote persistence, no PDF export, no
backend, no analytics, and no multi-currency switcher. **Rial only.**
