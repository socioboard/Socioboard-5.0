// Workspace roles and permissions (docs/backend/README.md#permissions). Used by the API to
// authorize requests and by the web app to show or hide actions. Platform admins are a separate
// axis, checked only on /api/admin/*.

export const ROLES = ['owner', 'admin', 'editor', 'contributor', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'workspace:delete',
  'billing:manage',
  'workspace:update',
  'members:manage',
  'accounts:connect',
  'accounts:manage',
  'posts:approve',
  'posts:publish',
  'posts:create',
  'posts:update-own',
  'media:upload',
  'ai:generate',
  'tasks:manage',
  'posts:read',
  'calendar:read',
  'analytics:read',
  'media:read',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const VIEWER: Permission[] = ['posts:read', 'calendar:read', 'analytics:read', 'media:read'];
const CONTRIBUTOR: Permission[] = [
  ...VIEWER,
  'posts:create',
  'posts:update-own',
  'media:upload',
  'ai:generate',
  'tasks:manage',
];
const EDITOR: Permission[] = [...CONTRIBUTOR, 'posts:approve', 'posts:publish'];
const ADMIN: Permission[] = [
  ...EDITOR,
  'workspace:update',
  'members:manage',
  'accounts:connect',
  'accounts:manage',
];
const OWNER: Permission[] = [...ADMIN, 'workspace:delete', 'billing:manage'];

export const ROLE_PERMISSIONS: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  owner: new Set(OWNER),
  admin: new Set(ADMIN),
  editor: new Set(EDITOR),
  contributor: new Set(CONTRIBUTOR),
  viewer: new Set(VIEWER),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
