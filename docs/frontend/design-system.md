# Package: ui (design system)

**Phase:** 0 (foundations + base components), extended per phase · **Path:** `packages/ui` · Built on shadcn/ui + Tailwind CSS; no designer for now, so this package is the design source of truth.

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
