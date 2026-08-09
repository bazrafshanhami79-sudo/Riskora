# DESIGN.md — ریسکورا

Design language, token architecture, and the reasoning behind each decision.

The system is taken from the supplied reference design: **monochrome editorial**.
A warm bone page, near-black type, no accent colour, near-square corners, serif
display headings, hairline rules, and a faint noise texture. Structure comes
from rules and whitespace rather than elevation, colour, or ornament.

**Non-negotiable:** numerical correctness outranks every design consideration.
The interface exists to make the number legible and explicable.

---

## 1. Tokens

Copied from the reference's `globals.css`, in oklch.

| Role | Value |
|---|---|
| `--background` | `oklch(0.985 0.002 90)` — warm bone |
| `--foreground` | `oklch(0.12 0.01 60)` — warm near-black |
| `--card` | `oklch(1 0 0)` |
| `--muted` | `oklch(0.94 0.005 90)` |
| `--muted-foreground` | `oklch(0.42 0.02 60)` |
| `--primary` | `oklch(0.12 0.01 60)` — the fill is ink, not a colour |
| `--border` | `oklch(0.88 0.01 90)` |
| `--radius` | `0.25rem` |

There is **no accent colour**. Emphasis comes from weight, scale and ink fills.
Status colours (destructive / success / warning) exist only where meaning
depends on them — validation results — and are muted to sit in the palette.

### One deliberate addition

`--control-border: oklch(0.62 0.01 90)`.

The reference's `--border` measures **1.38:1** against the page. That is right
for decorative rules on a marketing page, but this is a dense data-entry tool
where a control's border is the thing that says a field is there. Interactive
controls (inputs, selects, segmented groups) therefore use a stronger edge that
clears the **3:1** WCAG 1.4.11 threshold for UI components, measured at 3.49:1
on the page and 3.64:1 on cards. Structural rules keep the reference's
`--border` exactly.

### Light only

The reference declares a `dark` variant but ships **no dark token block**, so
there is no dark palette to follow and the theme toggle was removed. Adding one
would mean inventing a palette the reference does not specify.

---

## 2. Typography

| Role | Face |
|---|---|
| Body | **Vazirmatn Variable** |
| Display | **Instrument Serif** (Latin), Vazirmatn at display size for Persian |
| Mono | **JetBrains Mono Variable** (Latin labels and figures) |

All self-hosted via `@fontsource`; no external font requests.

The reference is built on Instrument Sans / Instrument Serif, both **Latin-only**.
Persian therefore keeps Vazirmatn as the text face — it is what makes the
interface readable — and the reference's Latin faces are used where they apply:
the wordmark, the `TM` tick, row numbers, and Latin figures.

Three rules follow from setting Persian:

- **`letter-spacing: 0`, always.** Persian letterforms join; any tracking breaks
  the connections.
- **`line-height: 1.85`** for body. Farsi needs more leading than Latin at the
  same size.
- **Eyebrows are not set in mono.** The reference sets them in JetBrains Mono,
  but that face has no Persian glyphs and its wide monospace space visibly gaps
  Farsi words. Persian eyebrows use the sans face and keep the reference's
  hairline-dash marker; mono is retained for Latin labels and figures, where it
  reads as intended.

Latin technical identifiers — EAR codes, machine names — are wrapped in
`.ltr-inline` (`direction: ltr; unicode-bidi: isolate`) so bidi reordering never
mangles them inside RTL text.

Persian digits for display; Latin, Persian and Arabic-Indic digits all accepted
on input, because underwriters paste figures from mixed sources.

---

## 3. Layout and interaction

**Navigation** follows the reference: transparent at rest, condensing into a
floating bordered bar once scrolled, with a serif wordmark and mono `TM`.

**The landing page** opens on an animated grain-gradient hero (`GrainGradient`
from `@paper-design/shaders-react`) with the headline over it, then the two
tools as **numbered rows separated by hairline rules**, not boxed cards. The
hero is set entirely in Vazirmatn — no serif display stack — and carries a
`black/35` scrim so the headline's contrast holds steady as the shader moves.

**Progressive disclosure** in the rating tool: the common inputs are open;
supplementary extensions and commercial settings sit behind labelled accordions.

**The premium is always visible** in a sticky bottom bar, updating live.

**The breakdown is a first-class view** — a composition bar, every ‰ component
down to the MD technical rate with the banded base and minimum-rate floor
exposed whenever the floor bites, then the premium waterfall.

**Scope-driven fields never lie.** Fields irrelevant to the current scope are
hidden or disabled, never left silently feeding the calculation.

**The rating form carries no helper text.** Every description under every input
was removed, along with section descriptions and accordion hints, so the page
reads as labels and controls only.

**The rate panel shows two figures and nothing else** — the MD technical rate
and the TPL rate. Both are read straight off the engine, so every input feeds
them: an earthquake loading, a maintenance period or an expediting percentage
moves the first; TPL category, surroundings or limit moves the second.
Validation detail renders only when something actually fails, so a valid form
leaves the column bare.

---

## 4. Motion

- Only `transform` and `opacity` are animated — compositor properties.
- Numbers settle when they change, keyed on the value so the animation replays
  without an effect or extra state. This is the only thing that moves during
  data entry.
- Navigation transitions run at the reference's 300–500ms; interaction feedback
  stays at 200ms.
- Dropdowns open on a 260ms scale-and-fade from the trigger edge and close on
  160ms; accordions animate their measured height over 300ms open / 220ms close.
  These are registered as `--animate-*` theme entries rather than hand-written
  classes — Tailwind cannot build a `data-[state=open]:` variant from raw CSS in
  a layer, so a hand-written class silently never applies.
- `prefers-reduced-motion: reduce` collapses all of it to 0.01ms.

---

## 5. Accessibility

- Every control has an accessible name; every input is bound to a visible label.
- Helper text is wired through `aria-describedby`; errors set `aria-invalid`,
  use `role="alert"`, and sit next to the field they belong to.
- Segmented controls are a proper `radiogroup`: one tab stop, arrow keys with
  roving `tabindex`, RTL-correct direction, named via `aria-labelledby`.
- Focus is always visible and never removed.
- Status changes announce through `role="status" aria-live="polite"`.
- Validation state is never conveyed by colour alone — each check carries an
  icon and Persian text.
- **Contrast is measured, not eyeballed.** Every text pair clears 4.5:1; the
  lowest is 6.13:1. Control borders clear 3:1. Verified by painting each token
  to a canvas and reading back sRGB, because `getComputedStyle` returns `oklch()`
  unconverted.
- No horizontal overflow at 390px or 1280px on any view.

---

## 6. Deliberately absent

No glassmorphism. No glow. No accent colour in the interface chrome. No
shadows. No dark theme, because the reference does not define one.

The one exception is the landing hero's animated gradient, added on request.
It is the only colour in the product and is confined to that one band; every
working surface stays monochrome.
