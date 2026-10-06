# Area: home

**Phase:** 4 · **Folder:** `features/home` · **Backend:** reads what other modules already serve: [posts](../../backend/modules/posts.md), [social-accounts](../../backend/modules/social-accounts.md), [scheduling](../../backend/modules/scheduling.md), [approvals](../../backend/modules/approvals.md), [notifications](../../backend/modules/notifications.md), [tasks](../../backend/modules/tasks.md); [analytics](../../backend/modules/analytics.md) in 6.1

Decided 2026-10-06: a workspace opens on its Calendar until phase 4. Before then a Home page would mostly repeat the Calendar; with approvals, comments and tasks (phase 4) and analytics (6.1) people need one place that answers "what needs me today?". From P4-F8, `/w/:slug` opens Home and the Calendar is one click away.

## Screen
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug` (and `/w/:slug/home`) | Home: what needs attention, what goes out next, setup, quick actions | member |

## Sections
In this order; a section with nothing in it doesn't show, and what each person sees follows their role.

| Section | Content | Who sees it |
| --- | --- | --- |
| **Needs attention** | Failed deliveries to retry, accounts to reconnect, posts waiting for **my** approval, comments that mention me. Each item opens where it's fixed (the post, the account, the review panel). Empty: a calm "Nothing needs you" line, not a placeholder card | Everyone, filtered to what they can act on (approvals only for `posts:approve`) |
| **Up next** | Today's and tomorrow's scheduled posts by account, in the workspace's time zone, and empty queue slots ("Instagram has nothing on Thursday") with Add to queue | People who can see posts |
| **Get started** | The setup checklist, moved from the Calendar (connect an account, first post, …) until it's done or dismissed | Owners and admins |
| **Quick actions** | New post, Add to queue, Connect account | By permission |
| **My tasks** | Tasks assigned to me, by due date | Everyone with tasks |
| **Performance** | Last 7 days: reach, engagement, the best post | 6.1, when analytics exists |
| **Recent activity** | Published, approved and changed, from the audit log | `workspace:update` (owners, admins) |

## Rules
- Built from the existing endpoints (posts filtered by status, accounts, the calendar range, approvals, notifications, tasks). A summary endpoint (`GET /workspaces/:wid/home`) only if the page needs more than about five requests to draw.
- Live: the same socket events that refresh posts, accounts and notifications refresh Home.
- Loading shows the sections' shapes (skeletons), never a blank page; each section loads on its own, so one slow source doesn't hold up the rest.
- The sidebar gets a Home link above Calendar; the command palette offers "Go to Home".
