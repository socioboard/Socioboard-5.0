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

export { Banner, type BannerProps } from './components/banner';
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Card } from './components/card';
export { Checkbox, RadioCard, RadioGroup, Switch } from './components/choice';
export {
  CommandPalette,
  type Command,
  type CommandGroup,
  type CommandPaletteProps,
} from './components/command-palette';
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
export { ConfirmDialog, type ConfirmDialogProps } from './components/confirm-dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuItemProps,
} from './components/dropdown-menu';
export { FileDropzone, type FileDropzoneProps } from './components/file-dropzone';
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
export { NavTabs } from './components/nav-tabs';
export { Kbd, PageHeader, type PageHeaderProps } from './components/page';
export { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './components/popover';
export { ProgressBar, type ProgressBarProps } from './components/progress-bar';
export { Spinner, type SpinnerProps } from './components/spinner';
export { toast, Toaster } from './components/toast';
export { Tooltip, TooltipProvider, type TooltipProps } from './components/tooltip';
