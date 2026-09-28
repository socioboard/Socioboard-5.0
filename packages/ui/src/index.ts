// @socioboard/ui: design tokens (styles.css) and shared React components.
// Tokens and the visual direction: docs/frontend/design-system.md.
export { Backdrop } from './backdrop';
export { cn } from './cn';
export {
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Combobox, type ComboboxOption, type ComboboxProps } from './components/combobox';
export {
  DataTable,
  type Column,
  type DataTableLabels,
  type DataTableProps,
  type SortState,
} from './components/data-table';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from './components/dialog';
export {
  Avatar,
  Badge,
  badgeVariants,
  EmptyState,
  initials,
  Skeleton,
  type AvatarProps,
  type BadgeProps,
  type EmptyStateProps,
} from './components/display';
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentProps,
} from './components/drawer';
export {
  FormField,
  Input,
  Label,
  Textarea,
  type FieldControlProps,
  type FormFieldProps,
} from './components/form';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/select';
export { Spinner, type SpinnerProps } from './components/spinner';
export { toast, Toaster } from './components/toast';
