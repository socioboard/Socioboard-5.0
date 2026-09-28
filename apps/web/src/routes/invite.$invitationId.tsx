import { createFileRoute } from '@tanstack/react-router';

import { InvitationScreen } from '../features/auth';

export const Route = createFileRoute('/invite/$invitationId')({
  component: function Invite() {
    const { invitationId } = Route.useParams();
    return <InvitationScreen invitationId={invitationId} />;
  },
});
