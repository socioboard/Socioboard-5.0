# QA: settings and profile

Area doc: [workspace-settings](../frontend/areas/workspace-settings.md) · Checks for every screen: [README](README.md#every-screen)

## General (owner, admin)
- [ ] **SET-01** Settings → General: name, URL, time zone; change the name → Save changes → saved, the sidebar shows the new name.
- [ ] **SET-02** Change the URL → after saving, the address moves to the new URL; the old address says "Workspace not found".
- [ ] **SET-03** Save changes stays disabled until something changes; only what changed is saved.
- [ ] **SET-04** Time zone: the list is searchable and scrolls with the mouse wheel; after saving, the calendar and post times use it.
- [ ] **SET-05** Logo: upload a JPEG, PNG or WebP under 2 MB → it shows in the switcher and on invitations. A larger file or another type is refused before uploading, with the limit.
- [ ] **SET-06** As editor, contributor or viewer: no General tab; Settings opens Members.

## Danger zone (owner only)
- [ ] **SET-10** Transfer ownership: pick an admin → confirm → they're owner, you're admin; the danger zone disappears for you.
- [ ] **SET-11** Delete workspace: the button stays disabled until the workspace's name is typed exactly; the dialog says how many scheduled posts will be cancelled.
- [ ] **SET-12** After deleting → another of your workspaces opens (or setup), never a "not found" flash.
- [ ] **SET-13** As admin: the danger zone isn't shown.
- [ ] **SET-14** General → Review → "Review every post before it goes out" → on at once (a toast says so); a new post by an editor then offers Submit for review instead of Publish now. Off again → only contributors' posts need review.

## Members and invitations
- [ ] **SET-20** Members table: name, email, role, joined; your own row is marked; on a laptop, names and emails have room (not squeezed).
- [ ] **SET-21** Invite people → email and role (each role explained in one line) → "Send invitation" → it's under pending invitations and the email arrives.
- [ ] **SET-22** Pending invitation: copy its link (to send another way) and revoke it; a revoked link no longer works.
- [ ] **SET-23** Change a member's role inline → saved; it applies at once (their screen updates after their next action).
- [ ] **SET-24** Remove a member → confirm → they lose access.
- [ ] **SET-25** You can't change or remove the owner or yourself.
- [ ] **SET-26** Leave the workspace (anyone but the owner) → you're moved to another workspace.
- [ ] **SET-27** As editor, contributor or viewer: the list is read-only; no invite, role or remove controls.
- [ ] **SET-28** Under each role, the accounts line: owners and admins show "All accounts" (not clickable). As owner or admin, click an editor's, contributor's or viewer's accounts line → "Only some accounts" → pick accounts → "Save access" → the line shows "1 account" (or how many); names and emails keep their room; picking none warns that they'll see no account.
- [ ] **SET-29** Signed in as that limited member: Accounts, the composer's account picker and groups show only their accounts; posts, the calendar and the queue show only posts that go to their accounts alone; a link to any other post says it wasn't found. Set "All accounts" again → everything is back at once.

## Profile
- [ ] **SET-30** Profile (user menu): change your name and time zone → saved; the user menu shows the new name.
- [ ] **SET-31** Photo: upload an image → it shows in the sidebar and member lists; a file too large or of the wrong type is refused with the limit.

## Security
- [ ] **SET-40** Change password: current and new password → saved; other devices are signed out (by default); the old password no longer works.
- [ ] **SET-41** An account made with Google, Microsoft or an email link: "Set a password" → the email arrives → its link creates a password.
- [ ] **SET-42** Two-factor: enter your password → a QR code and a key in groups of four → scan with an authenticator app → enter its code → on; backup codes to copy or download.
- [ ] **SET-43** Turning 2FA off and making new backup codes both ask for your password; old backup codes stop working after new ones are made.
- [ ] **SET-44** Sessions: each device is listed ("Chrome on Windows"), with this one marked; "Sign out" on one ends it; "Sign out everywhere else" ends all others.

## Not built yet
The activity log (phase 5), email change.
