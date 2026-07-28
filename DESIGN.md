# DESIGN.md — ریسکورا EAR

Design language, token architecture, and the reasoning behind each decision.

**Brief:** a premium insurtech product for a professional Iranian underwriter. Confident,
precise, quietly luxurious. Restraint over decoration — sophistication from typography,
spacing, and material quality rather than gradients, glows, or ornament.

**Non-negotiable:** numerical correctness outranks every design consideration. The interface
exists to make the number legible and explicable, never to decorate it.

---

## 1. Direction

Queried from `ui-ux-pro-max`: the product type resolves to **Financial Dashboard**, whose
primary style recommendation is **Dark Mode (OLED) + Data-Dense** with Minimalism secondary,
and a colour focus of "dark background + trust colour". The *Banking/Traditional Finance*
palette pairs an ink foundation with a WCAG-adjusted **premium gold** — which is exactly the
"one restrained metallic accent" the brief calls for.

Design dials used: `--variance 3` (centred/minimal), `--motion 2` (subtle), `--density 8`
(dense dashboard).

Two recommendations were **rejected**:

- The `--design-system` run matched the pattern *Product Review/Ratings Focused* — a misroute
  on the word "rating" (product ratings, not insurance rating). Discarded.
- Its style match, *Exaggerated Minimalism* (`font-size: clamp(3rem, 10vw, 12rem)`,
  `font-weight: 900`, `letter-spacing: -0.05em`), is wrong for a dense underwriting form and its
  negative tracking is actively harmful to Persian. Discarded.

---

## 2. Token architecture

Three layers, per `design-system`: **primitive → semantic → component**. Components never
reference a raw hex; the semantic layer is what switches theme.

```
--ink-900: #0b1220        (primitive: raw value)
      ↓
--bg: var(--ink-900)      (semantic: purpose alias, re-pointed per theme)
      ↓
.card { background: var(--surface) }   (component)
```

Semantic tokens are mapped into Tailwind utilities via `@theme inline`, so `bg-surface`,
`text-fg-muted`, and `border-border` resolve through the same variables the theme switches.

### Palette

| Role | Dark | Light |
|---|---|---|
| `--bg` page | `#0b1220` | `#f1f5f9` |
| `--surface` card | `#0f1828` | `#ffffff` |
| `--surface-sunken` input | `#060a12` | `#f8fafc` |
| `--fg` | `#eef3fb` | `#0a1121` |
| `--fg-muted` | `#a7b6cd` | `#4d5b73` |
| `--fg-subtle` | `#7c8ba6` | `#5f6d80` |
| `--accent` | `#d5ac57` | `#9a5e07` |
| `--border` | `#22324f` | `#e2e8f0` |

**One accent, used sparingly** — the primary result, the active segment of a control, and the
erection component of the rate bar. Nothing else competes for it. No indigo-on-white SaaS
default, no gradients, no glow.

Dark is the default and the more striking theme, as the brief asks.

### Contrast

Every foreground/background pair was measured, not eyeballed. All pass **WCAG AA 4.5:1** in
both themes; the lowest is 4.55:1.

Two light-mode values were darkened after measurement: `--fg-subtle` from `#64748b` (4.34:1 on
the page background) to `#5f6d80`, and `--accent` from `#a16207` (4.49:1) to `#9a5e07`. Both
cleared 4.5:1 against white but failed against the page background — the kind of miss that only
shows up when you actually compute it.

### Spacing and radius

Density 8/10 → a 4–32px scale (`--space-1` … `--space-8`). Radius `6 / 10 / 14px` for
control, card, and panel respectively.

### Depth

Subtle only: fine 1px borders, layered surfaces (`--bg` < `--surface` < `--surface-raised`),
and a restrained two-stop shadow. No glassmorphism, no neon.

---

## 3. Persian typography

**Vazirmatn Variable**, self-hosted via `@fontsource-variable/vazirmatn` — no external font
request, so the tool works offline.

Persian is not Latin with different glyphs, and three rules follow from that:

- **`letter-spacing: 0`, always.** Persian letterforms join; any tracking breaks the
  connections. This is set on `html` so nothing inherits Latin-tuned metrics. A baseline pass
  caught and removed a `tracking-tight` on the brand name and `uppercase tracking-wide` on
  section headings — `uppercase` is a no-op in Persian, and the tracking was doing real damage.
- **`line-height: 1.85`** for body. Farsi needs more leading than Latin at the same size,
  because of its descenders and diacritics.
- **`font-variant-numeric: tabular-nums`** on every figure (`.tabular`). Money and rates read
  as columns, not prose.

Latin technical identifiers — EAR codes, machine names like
`02.0.1 — Boiler feed pumps, incl. drive — turbine driven` — are wrapped in `.ltr-inline`
(`direction: ltr; unicode-bidi: isolate`) so bidi reordering never mangles them inside RTL text.

Persian digits for display; Latin, Persian, and Arabic-Indic digits all accepted on input,
because underwriters paste figures from mixed sources.

---

## 4. Layout and interaction

**Progressive disclosure.** Sections 1–3 (project, amounts, common options) are visible by
default — that is what most quotes need. Supplementary extensions and commercial settings are
collapsed behind labelled accordions. Section 6 appears only in Individual-Machines scope.

**The premium is always visible.** A sticky bottom bar carries the validation status, the MD
technical rate, and the total payable, updating live. It is solid rather than translucent: it
sits over scrolling content, where `backdrop-filter` repaints every frame.

**The breakdown is a first-class view, not a footnote.** A sticky side panel shows the rate
build-up — a proportional composition bar, then every ‰ component down to the MD technical rate,
with the banded base and minimum-rate floor exposed whenever the floor bites — followed by the
premium waterfall from gross MD through add-ons and TPL to the total payable. The underwriter
can always see *why* the number is what it is.

**Scope-driven fields never lie.** Fields irrelevant to the current scope are hidden or
disabled, never left silently feeding the calculation.

**Every input has a Persian helper line**, taken from the workbook's own `D` column and `Data`
sheet notes, so the wording the underwriter already knows carries over.

---

## 5. Motion

Brief and purposeful, and there is very little of it.

- **Only `transform` and `opacity`** are animated — compositor properties. No layout
  properties, ever.
- **≤ 200ms**: `--duration-fast: 120ms`, `--duration-base: 180ms`. Stock `ease-out`; no
  bespoke easing curves.
- **Numbers settle when they change** — a 180ms opacity/translate on recalculation, keyed on
  the value so the animation replays without an effect or extra state. This is the only thing
  on the page that moves.
- `prefers-reduced-motion: reduce` collapses all of it to 0.01ms.

---

## 6. Accessibility

Audited with `fixing-accessibility` and verified by driving the real page with a browser.

- Every control has an accessible name; every input is bound to a visible `<label>`.
- Helper text is wired through `aria-describedby`; errors set `aria-invalid`, use `role="alert"`,
  and sit next to the field they belong to.
- The segmented controls are a proper `radiogroup`: one tab stop, arrow keys moving between
  options with roving `tabindex`, RTL-correct direction. They are named with `aria-labelledby`
  rather than a `<label for>`, since a `div` is not a labelable element.
- Tab order matches visual order — verified by walking the first twelve stops and reading back
  each accessible name.
- Focus is always visible: a 2px accent outline, never removed.
- Decorative icons are `aria-hidden`; the composition bar carries a text `role="img"` label.
- Status changes announce through `role="status" aria-live="polite"`.
- Validation state is never conveyed by colour alone — each check carries an icon and Persian
  text.
- No horizontal overflow at 390px or 1440px.

---

## 7. Deliberately absent

No gradients. No glassmorphism. No glow. No second accent colour. No decorative illustration.
No animated charts. No user accounts, quote persistence, PDF export, or currency switcher —
those are out of scope by instruction, not by oversight.
