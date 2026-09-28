// What the signed-in user may do in the current workspace, from the same role → permission map the
// API enforces (packages/contracts). Hide what they can't do; the API still checks every request.
import { can, type Permission } from '@socioboard/contracts';
import { useCallback } from 'react';

import { useWorkspace } from './workspace';

export function useCan(): (permission: Permission) => boolean {
  const { role } = useWorkspace();
  return useCallback((permission: Permission) => can(role, permission), [role]);
}
