# Package: ui (design system)

**Phase:** 0 (foundations + base components), extended per phase · **Path:** `packages/ui` · Built on shadcn/ui + Tailwind CSS (Radix behaviour, our own styling, not the stock shadcn look); no designer for now, so this package is the design source of truth.

## Visual direction (P0-F0, chosen 2026-09-28)

**Graphite with glass**: direction A (calm, precise, Linear-like structure) with frosted-glass surfaces, in light and dark. Reference boards: the design canvas "Socioboard 6.0 visual directions", row "Direction A, glass" (AG-Calendar, AG-Composer, AG-Media). The Socioboard logo is the only asset kept from 5.0.

| Token group | Decision |
| --- | --- |
| Type | Instrument Sans (400/500/600/700), tabular figures on; sizes 11/12/13/14/16/21 px for the app |
| Surfaces | Floating panes, 12 px apart and from the window edge, radius 18. Glass = `backdrop-filter: blur(28px) saturate(170%)` over a translucent fill (light `rgba(255,255,255,.56)`, dark `rgba(20,23,30,.52)`), 1 px bright edge, inset top highlight, soft deep shadow. Without backdrop-filter support: a more opaque fill (`.74` / `.66`) |
| Backdrop | Base light `#E9ECF2`, dark `#07090D`; three large blurred glows in the **Aurora** palette (rose, lilac, mint) at medium strength, drifting slowly; film grain at 5 % (light) / 7 % (dark). Chosen over "too much orange and blue" and "too grey" |
| Ink | Light `#11141A` / `#3D4452` / `#596170`; dark `#EEF0F4` / `#B9BFCB` / `#8F96A4`. Text on glass must keep 4.5:1 |
| Accent | Socioboard red-orange `#D63A1B` (with a lighter `#E8502E` top for a lit gradient) on primary buttons and the calendar's "now" line only. No blue in the chrome |
| Selection and focus | Aurora violet ring: light `#5B45C4`, dark `#C3B5FF`, with a soft glow |
| Status | Published green, scheduled neutral, failed red, needs approval amber, draft dashed; tinted fills show through glass |
| Radius | 10 (controls, chips, cards), 14 (media), 18 (panes), full (pills) |
| Motion | Panes settle in once (blur to sharp, 0.7 s, `cubic-bezier(.16,1,.3,1)`); the now line draws in; hovers lift 1–2 px; ambient backdrop drift. All off under `prefers-reduced-motion` |

**In code (P0-F1):** tokens are CSS variables in `packages/ui/src/styles.css`, exposed to Tailwind (`bg-glass`, `text-ink-2`, `rounded-pane`, …) plus utilities `glass`, `glass-chip`, `accent-lit`, `ring-selected` and `animate-settle`. `ThemeProvider` / `useTheme` handle light, dark and system (saved in `localStorage` as `sb-theme`, followed across tabs; `index.html` applies it before first paint). Reduced motion stops decorative motion only (backdrop drift, pane entrance); spinners and progress keep moving, and components use `motion-reduce:` for their own decorative transitions. `Backdrop` renders the ambient glows and grain, sized to the viewport.

**Components (P0-F2):** built on Radix (the `radix-ui` package) for keyboard, focus and screen-reader behavior, styled with the tokens; Sonner for toasts; lucide icons.

| Component | Notes |
| --- | --- |
| `Button` | `primary` (lit orange, one per screen), `secondary` (glass), `ghost`, `danger` (crimson `#BE123C`, so it never reads as the primary action); sizes `sm`/`md`/`lg`/`icon`; `loading` blocks clicks and sets `aria-busy`; `asChild` renders a link; defaults to `type="button"` |
| `Input`, `Textarea`, `Label`, `FormField` | `FormField` links label, hint and error to the control (`aria-describedby`, `aria-invalid`, `aria-required`); the error replaces the hint and is announced |
| `Select` | Radix Select in a glass popover; keyboard and typeahead |
| `Dialog` | Centered glass dialog over a blurred scrim; focus trapped and returned; always has a title |
| `Drawer` | The same dialog anchored right; a bottom sheet under 640 px. Built on Radix Dialog instead of Vaul (unmaintained since 2024) |
| `Toaster`, `toast` | Glass toasts following the theme; mount once at the root (done in `__root.tsx`) |
| `DataTable` | Server-driven: headers ask the server to sort (`aria-sort`), rows open with click or Enter, skeleton rows while loading, `empty` and `error` (with retry) states, "Load more" for cursor pages. No client-side table engine; adopt TanStack Table if a view needs client sorting, filtering or column resizing |
| `EmptyState`, `Skeleton`, `Spinner`, `Avatar`, `Badge` | Avatar shows the photo or initials on a tint picked from the name; Badge tones `neutral`, `success`, `warning`, `danger`, `accent`, `outline` with an optional dot |

Using them in screens:
- The few words components carry (Close, Load more, Try again, Loading) default to English; screens pass translated ones (`closeLabel`, `labels`) so they follow the app's language.
- Clickable `DataTable` rows open with click or Enter, but screen readers announce a row, not a link: also put a real link (or button) in the row's main cell.
- `Button asChild` renders its child (e.g. a router Link); `loading` applies only to real buttons.

A development-only preview of every component lives at `/dev/components` until the catalog (P0-F8) replaces it.

## Foundations (phase 0)
- **Tokens:** color (light + dark themes, semantic colors for success/warning/error/info, one brand accent), typography scale, spacing, radius, shadows, z-index, motion (respects reduced motion).
- **Network colors and icons:** one icon + brand color per network, used consistently in pickers, previews and calendar cards.
- **Status colors:** one mapping for post/target statuses used everywhere (`StatusChip`).

## Components by phase
| Phase | Components |
| --- | --- |
| 0 | Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Switch, RadioGroup, Label, FormField, Dialog, Drawer, Popover, DropdownMenu, Tooltip, Toast, Tabs, Badge, Avatar, AvatarStack, Card, DataTable (sort, cursor pagination), EmptyState, Skeleton, Spinner, Banner, ConfirmDialog, CommandPalette, PageHeader, Sidebar, FileDropzone, ProgressBar |
| 1 | AccountPicker, NetworkIcon, StatusChip, MediaThumb, CharacterCounter, IssueList, PreviewFrame (base for network previews) |
| 2 | DateTimePicker (timezone-aware), CalendarEventCard, NotificationItem, TimelineItem |
| 3 | BoardPicker, PrivacyPicker, per-network option panels |
| 4 | CommentThread, MentionInput, SchemaForm (renders JSON Schema → fields, for AI templates), JobProgress |
| 5 | UsageMeter, PlanCard, KpiTile |
| 6.1 | Chart wrappers (Line, Bar, Area) with theme tokens, DateRangePicker, MetricDelta |

## Rules
- Components are accessible by default (keyboard, focus, ARIA, labels) and tested with Testing Library.
- A live component catalog (Ladle or Storybook) runs in dev so screens can be built from it.
- Feature code never styles raw HTML for something the design system provides.
