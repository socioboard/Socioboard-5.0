import { can, workspaceRoutes as r } from '@socioboard/contracts';

import { toHeaders, type ApiRouter } from '../../platform';
import type { WorkspaceService } from './service';

/** Mounts the workspace, member and invitation routes (contracts: workspaceRoutes). */
export function registerWorkspaceRoutes(api: ApiRouter, ws: WorkspaceService) {
  api.route(r.createWorkspace, async ({ auth, body, req, res }) => {
    const { value, setCookies } = await ws.create(auth, toHeaders(req.headers), body);
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);
    return value;
  });
  api.route(r.listWorkspaces, async ({ auth }) => ({ items: await ws.list(auth) }));
  api.route(r.getWorkspace, ({ member }) => ws.get(member));
  api.route(r.updateWorkspace, ({ auth, member, body }) => ws.update(auth, member, body));
  api.route(r.createLogoUpload, ({ member, body }) => ws.createLogoUpload(member, body));
  api.route(r.deleteWorkspace, ({ auth, member, body }) =>
    ws.remove(auth, member, body.confirmName),
  );
  api.route(r.transferOwnership, ({ auth, member, body }) =>
    ws.transferOwnership(auth, member, body.memberId),
  );

  api.route(r.listMembers, async ({ member }) => ({ items: await ws.listMembers(member) }));
  api.route(r.updateMember, ({ auth, member, params, body }) =>
    ws.updateMember(auth, member, params.memberId, body.role),
  );
  api.route(r.removeMember, ({ auth, member, params }) =>
    ws.removeMember(auth, member, params.memberId, can(member.role, 'members:manage')),
  );

  api.route(r.createInvitation, ({ auth, member, body }) => ws.invite(auth, member, body));
  api.route(r.listInvitations, async ({ member }) => ({ items: await ws.listInvitations(member) }));
  api.route(r.revokeInvitation, ({ auth, member, params }) =>
    ws.revokeInvitation(auth, member, params.invitationId),
  );
  api.route(r.getInvitation, ({ params }) => ws.preview(params.invitationId));
  api.route(r.acceptInvitation, async ({ auth, params, req, res }) => {
    const { value, setCookies } = await ws.accept(
      auth,
      toHeaders(req.headers),
      params.invitationId,
    );
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);
    return value;
  });
  api.route(r.declineInvitation, ({ auth, params }) => ws.decline(auth, params.invitationId));
}
