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
| Motion | Everything that changes moves: pages crossfade, sections rise in turn, highlights glide, lists reflow, things leave quickly. Panes settle in once (blur to sharp, 0.7 s); the now line draws in; hovers lift 1–2 px; ambient backdrop drift. Details under **Motion** below; decorative motion is off under `prefers-reduced-motion` |

**In code (P0-F1):** tokens are CSS variables in `packages/ui/src/styles.css`, exposed to Tailwind (`bg-glass`, `text-ink-2`, `rounded-pane`, …) plus utilities `glass`, `glass-float` (a denser frost for layers floating over content, such as Select and Combobox lists, so a bright button underneath doesn't tint them), `glass-chip`, `accent-lit`, `ring-selected` and `animate-settle`. Scrollbars are thin and token-colored everywhere. The base color's Tailwind name is `canvas` (`bg-canvas`), not `base`: `text-base` would otherwise also set the text to the background color. `ThemeProvider` / `useTheme` handle light, dark and system (saved in `localStorage` as `sb-theme`, followed across tabs; `index.html` applies it before first paint). Reduced motion stops decorative motion only (backdrop drift, pane entrance); spinners and progress keep moving, and components use `motion-reduce:` for their own decorative transitions. `Backdrop` renders the ambient glows and grain, sized to the viewport.

**Components (P0-F2):** built on Radix (the `radix-ui` package) for keyboard, focus and screen-reader behavior, styled with the tokens; Sonner for toasts; lucide icons.

| Component | Notes |
| --- | --- |
| `Button` | `primary` (lit orange, one per screen), `secondary` (glass), `ghost`, `danger` (crimson `#BE123C`, so it never reads as the primary action); sizes `sm`/`md`/`lg`/`icon`; `loading` blocks clicks and sets `aria-busy`; `asChild` renders a link; defaults to `type="button"` |
| `Input`, `Textarea`, `Label`, `FormField` | `FormField` links label, hint and error to the control (`aria-describedby`, `aria-invalid`, `aria-required`); the error replaces the hint and is announced |
| `Select` | Radix Select in a glass popover; keyboard and typeahead |
| `Combobox` (P0-F4) | A Select with a search box, for long lists (time zones): a button opens a glass popover with a filter input (`role="combobox"`) over a listbox. Opens centered on the current choice, even when the popover resizes or flips above the field. Every typed word must match the label, hint or hidden `keywords`; arrows/Page keys move, Enter picks, Escape closes and returns focus. Takes `FormField` control props |
| `Dialog` | Centered glass dialog over a blurred scrim; focus trapped and returned; always has a title |
| `Drawer` | The same dialog anchored right; a bottom sheet under 640 px. Built on Radix Dialog instead of Vaul (unmaintained since 2024) |
| `Toaster`, `toast` | Glass toasts following the theme; mount once at the root (done in `__root.tsx`) |
| `DataTable` | Server-driven: headers ask the server to sort (`aria-sort`), rows open with click or Enter, skeleton rows while loading, `empty` and `error` (with retry) states, "Load more" for cursor pages. No client-side table engine; adopt TanStack Table if a view needs client sorting, filtering or column resizing |
| `DropdownMenu` (P0-F5) | Radix menu in `glass-float`: items with icon and hint, `tone="danger"`, radio groups (theme) with a check, labels, separators |
| `Tooltip` (P0-F5) | Short label on hover or keyboard focus (400 ms delay); supplements an `aria-label`, never replaces it. `TooltipProvider` is mounted by the app shell (not the root, so sign-in pages don't load tooltip code) |
| `Banner` (P0-F5) | Notice above the content: `info`, `warning` (polite status), `danger` (alert); optional action and dismiss |
| `CommandPalette` (P0-F5) | ⌘K dialog: a search box over grouped commands; the same word matching as Combobox; arrows wrap; Enter runs and closes; opens with an empty search each time |
| `Checkbox`, `Switch`, `RadioGroup` + `RadioCard` (P0-F6) | Checkbox with its label (and optional description) for choices saved by a form button; Switch for settings that apply at once; RadioCard is a selectable card with a one-line explanation (roles) |
| `DateTimePicker` (P2-F1) | A month to pick a day from, and a time field (the browser's own, so phones show their time wheel). The value is a wall-clock day and time (`{ date: 'YYYY-MM-DD', time: 'HH:mm' }`) in the `timeZone` it is given, which decides which day is today; the screen turns it into an instant with `zonedTime` from the contracts. `minDate` / `maxDate` switch days off and stop the month arrows. A grid for screen readers (each day named in full, the chosen one `aria-selected`, today `aria-current`); only one day is in the tab order, arrows move by day and week, Home/End to the week's ends, Page Up/Down by month, staying within the range. Months slide in from the side they lie on and the mark glides between days. Weeks start on Monday unless `weekStartsOn` says otherwise |
| `ConfirmDialog` (P0-F6) | "Are you sure?" with progress while `onConfirm` runs, the error kept in the dialog on failure, and optional type-to-confirm (deleting a workspace) |
| `NavTabs` (P0-F6) | Tabs that are pages: a row of router links with the active one underlined in the selection color. Radix Tabs (panels within one page) are added when a screen needs them |
| `FileDropzone` (P0-F7) | Makes an area accept dropped files, with a glass overlay saying what dropping does; ignores drags without files. Always paired with a visible upload button |
| `ProgressBar` (P0-F7) | Thin bar in the selection color, announced as a progressbar with its value; without a value it runs an indeterminate sweep (kept under reduced motion, like spinners) |
| `Card`, `Popover` (P0-F7) | Card: a light surface for tiles, with the selection ring when `selected`. Popover: a small glass panel for quick forms (New folder) |
| `PageHeader`, `Kbd` (P0-F5) | The 56 px bar at the top of a content pane holding the page's h1 and actions; a keyboard key chip |
| `EmptyState`, `Skeleton`, `Spinner`, `Avatar`, `Badge` | Avatar shows the photo or initials on a tint picked from the name (`decorative` when the name is already shown beside it, so screen readers don't read it twice); Badge tones `neutral`, `success`, `warning`, `danger`, `accent`, `outline` with an optional dot |
| `NetworkIcon` (P1-F9) | A network's mark from Simple Icons (CC0; LinkedIn, missing there, gets an "in" mark until its brand kit in phase 3): `tile` (glyph on the brand colour, Instagram's gradient) for pickers and avatars, `glyph` for text lines. Brand colours only where they read in both themes; black brands (X, TikTok) follow the ink. `networkName()` gives the name people know |
| `StatusChip` (P1-F9) | The one status mapping: draft dashed, in review amber, approved and scheduled neutral, publishing violet with a quiet pulse (off under reduced motion), published green, partly published amber, failed red; `pending` and `cancelled` for deliveries |
| `AccountPicker` (P1-F9) | Avatars grouped by network, each with its network tile; toggle buttons (`aria-pressed`) named "Account, Network". Accounts that can't post (reconnect, paused) show greyed with the reason and can't be picked, though one already chosen can still be removed. They use `aria-disabled`, not `disabled`, so they still take focus and hover and the reason's tooltip shows |
| `CharacterCounter` (P1-F9) | Count against one network's limit: quiet, amber from 90 %, red "−N" past it; screen readers hear the full sentence (hidden text; the short count is `aria-hidden`) |
| `IssueList` (P1-F9) | Validation issues, errors before warnings, each with its network; an issue with `onSelect` is a button that jumps to the fix. Optional "ready" line when empty |
| `MediaThumb` (P1-F9) | A file as a square: picture, video length or GIF tag, uploading/processing spinner, failed state, optional remove button (shown on hover, focus and touch). A picture that fails to load (expired link, file gone) falls back to the placeholder |
| `PreviewFrame` (P1-F9) | The card network previews are drawn in (P1-F3): account header with the network's mark, text and media in the network's order (`mediaFirst` for Instagram), on `--sb-preview-*` paper that follows the network's own light/dark look rather than the app's glass (`-bg`, `-ink`, `-ink-2`, `-line`, `-link` for hashtags/mentions/links, `-well` for placeholders, link cards and comment bubbles) |

Using them in screens:
- The few words components carry (Close, Load more, Try again, Loading) default to English; screens pass translated ones (`closeLabel`, `labels`) so they follow the app's language.
- Clickable `DataTable` rows open with click or Enter, but screen readers announce a row, not a link: also put a real link (or button) in the row's main cell.
- `Button asChild` renders its child (e.g. a router Link); `loading` applies only to real buttons.

**Catalog (P0-F8):** `pnpm catalog` opens the component catalog (Ladle) at http://localhost:61000; `pnpm --filter @socioboard/ui catalog:build` builds it as static files. Stories sit next to the components (`src/components/*.stories.tsx`, plus `src/stories/` for foundations) and render in the real frame: tokens, Instrument Sans, the Aurora backdrop, tooltips and toasts, following Ladle's light/dark switch and its phone/tablet/desktop widths. A test (`src/__tests__/catalog.test.ts`) fails when an exported component isn't rendered in any story, so the catalog can't fall behind. Ladle runs its own Vite 6 and React plugin; the catalog config gives it only the Tailwind plugin.

## Foundations (phase 0)
- **Tokens:** color (light + dark themes, semantic colors for success/warning/error/info, one brand accent), typography scale, spacing, radius, shadows, z-index, motion (respects reduced motion).
- **Network colors and icons:** one icon + brand color per network, used consistently in pickers, previews and calendar cards.
- **Status colors:** one mapping for post/target statuses used everywhere (`StatusChip`).

## Components by phase
| Phase | Components |
| --- | --- |
| 0 | Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Switch, RadioGroup, Label, FormField, Dialog, Drawer, Popover, DropdownMenu, Tooltip, Toast, Tabs, Badge, Avatar, Card, DataTable (sort, cursor pagination), EmptyState, Skeleton, Spinner, Banner, ConfirmDialog, CommandPalette, PageHeader, Sidebar, FileDropzone, ProgressBar |
| 1 | AccountPicker, NetworkIcon, StatusChip, MediaThumb, CharacterCounter, IssueList, PreviewFrame (base for network previews) |
| 2 | DateTimePicker (timezone-aware), CalendarEventCard, NotificationItem, TimelineItem |
| 3 | BoardPicker, PrivacyPicker, per-network option panels |
| 4 | AvatarStack, CommentThread, MentionInput, SchemaForm (renders JSON Schema → fields, for AI templates), JobProgress |
| 5 | UsageMeter, PlanCard, KpiTile |
| 6.1 | Chart wrappers (Line, Bar, Area) with theme tokens, DateRangePicker, MetricDelta |

Phase 2: DateTimePicker arrived with P2-F1. CalendarEventCard arrives with P2-F2: grouped account avatars and networks, workspace time, text, the post's picture leading the card (month) or a single line (`compact`, week), recurrence marker and distinct delivery statuses; FullCalendar owns interaction, focus and dragging. Catalogue story: `CalendarEventCard.Deliveries`.

Phase 0 components are built with the task that first uses them: Button through CommandPalette so far (P0-F2, P0-F4 Combobox, P0-F5 menus, tooltip, banner, palette, page header); Checkbox, Switch, RadioGroup, NavTabs and ConfirmDialog with settings (P0-F6); FileDropzone, ProgressBar, Card and Popover with the media library (P0-F7); AvatarStack with approvals and comments (P4-F7), where several people first appear together. IconButton is `Button size="icon"`. The Sidebar is app-specific, so it lives in `apps/web` (`features/shell`), not here. P0-F8 catalogs them all.

## Rules
- Components are accessible by default (keyboard, focus, ARIA, labels) and tested with Testing Library.
- **Cursors:** everything clickable shows the hand; anything disabled shows "not allowed". A base-layer rule in `styles.css` covers buttons, links, tabs, menu items, options, radios, checkboxes, switches and file inputs (Tailwind v4 leaves buttons on the arrow; labels of text fields keep the arrow, checkbox and radio labels set the hand themselves); a clickable element outside that list (a clickable row or `div`) sets `cursor-pointer` itself. Disabled controls never use `pointer-events-none`, which would hide the not-allowed cursor; hover styles use `not-disabled:hover:`. The end-to-end tests check the cursor of every control on each screen they visit (`e2e/support/cursors.ts`).
- A live component catalog (Ladle or Storybook) runs in dev so screens can be built from it.
- Feature code never styles raw HTML for something the design system provides.

## Motion
Motion answers what the person did and shows what changed; nothing moves for decoration alone. Only transform, opacity and small blurs animate (cheap to draw), arrivals are soft and leavings are quick. The rulebook is Apple's *Designing Fluid Interfaces* as translated for the web in the `apple-design` Claude skill (installed globally): respond on press, never lock out input, springs without overshoot unless a gesture carried momentum, enter and leave along the same path, and a gentler equivalent (not nothing) for people who reduce motion.
- **Tokens** (`styles.css`): `--ease-out-soft` (arrivals), `--ease-exit` (leaving), `--ease-spring` (a critically damped spring as CSS `linear()`: quick, no overshoot). Animations: `animate-rise` / `animate-enter` (rise 8 px from a 3 px blur; `--i` staggers siblings 40 ms apart, 12 steps at most), `stagger-children` (each direct child rises in turn, from `--stagger-base`), `animate-scale-in` (chips, checks, badges spring up), `animate-pop-in`/`-out` (menus, lists, tooltips: grow from their trigger with the Radix transform origin), `animate-dialog-in`/`-out`, `animate-sheet-*` (drawers), `animate-nudge` (a field that just became invalid), `hover-lift` (clickable cards lift 2 px with a deeper shadow and give a little when pressed), `press`.
- **Pages** change with a view transition (TanStack Router, type `page`, only when the path changes): the content pane (`.sb-page`) crossfades and sharpens while the sidebar stays still, and the page's sections rise in turn (`stagger-children` on each page's content). Changes within a page (tabs as `?tab=`, drawers) don't transition the page.
- **Theme switch** reveals the new theme in a circle growing from the toggle (`switchTheme`, view transition type `theme`).
- **Motion library** (`motion`, wrapped in `@socioboard/ui/motion`): `MotionProvider` (follows reduced motion), `springs` in Apple's terms (`bounce` ≈ 1 − damping ratio, `visualDuration` ≈ response): `snappy` (0.3 s) and `gentle` (0.4 s) never overshoot; `momentum` (bounce 0.2) is only for things flicked, thrown or released from a drag, `Collapse` (opens to its content's height), `Swap` (content changing in place: a status, "Saving…" → "Saved", onboarding steps sideways), `listItem(i)` / `listItemMotion` (items that arrive in turn, leave, and move to their new place: media grid, media strip, label chips, issues), shared `layoutId` highlights (sidebar, tab bar, composer tabs and Edit/Preview), `useChangeMotion(key)` (content refreshed in place without remounting: composer panel and preview), `staggerStyle(i)`. A list using `AnimatePresence mode="popLayout"` needs a positioned parent (`relative`): leaving items are taken out of the flow and placed against it. Content on its way out (`Leaving`, used by `Swap` and `Collapse`) is inert and hidden from assistive tech.
- **Components:** buttons give a little when pressed (scale 0.97); checkbox checks and radio dots spring in; the switch thumb springs and stretches while pressed; tabs (`NavTabs`) have an underline gliding to the active tab; table rows rise in turn; empty states, dialogs and drawers bring their parts in one after another; badges change colour smoothly; pictures fade and sharpen in once loaded; errors rise in.
- **Gestures** (`gestures.ts`): `project(velocity)` (where a flick is heading, Apple's deceleration projection), `rubberband()` (edges resist progressively), `createVelocityTracker()` (speed at release, counting a pause before letting go). The phone bottom sheet (`DrawerContent` under 640 px) has a grab handle: it follows the finger 1:1 from where it was grabbed, resists being pulled up, and on release closes if the projected position passes half its height (continuing down from where it is), else springs back with the finger's speed; grabbing it mid-spring takes it from there. Only a press starts a drag (a mouse passing over the handle doesn't move it); the close button does the same for keyboards and screen readers.
- **Reduced motion** is a gentler equivalent, not nothing: every movement, scale and blur becomes a short crossfade (the `--animate-*` tokens swap under the media query; Motion keeps only opacity), pages and the theme crossfade, lifts stop, the publishing pulse stops. Spinners, progress and skeletons keep moving (they say something is happening). Tests turn Motion's animations off (`skipMotionInTests`), so they see the end state.
- **Reduced transparency** and **more contrast:** glass becomes solid (`--sb-opaque`, no blur); more contrast also strengthens hairlines, edges and tertiary text.
- **Page changes are short** (0.08 s out, 0.2 s in): a view transition covers the page while it runs, and input shouldn't wait; the page's own sections then rise in while staying usable.
- **Type tracking follows size** (Tailwind `--text-*--letter-spacing`): small text +0.01em, body near 0, headings tighter (−0.02em at `text-2xl`); `tracking-*` classes still override.

## Label colours
Post labels (P1-B11, UI in P1-F8) store a colour **name**: gray, red, orange, amber, green, teal, blue, indigo, violet, pink. The design system maps each to a chip background and text colour per theme (light and dark), so a label always meets contrast; hex values are never stored. Built in P1-F8 as `LabelChip` (name on its colour, optional remove button) and `LabelSwatch` (the colour dot in pickers and menus), from one table (`LABEL_COLORS`); the catalog shows every colour.
