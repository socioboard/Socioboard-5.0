# QA: posts

Area doc: [posts](../frontend/areas/posts.md) · Checks for every screen: [README](README.md#every-screen)

## The posts list
- [ ] **POST-01** Posts: tabs All, Drafts, Scheduled, Published, Failed; each tab shows only its posts and has its own empty state.
- [ ] **POST-02** Each row: the first two lines of text and file count, labels, the accounts (pictures with the network's mark; names on hover), status, when (published, scheduled, or created) and author.
- [ ] **POST-03** A row opens the post's page.
- [ ] **POST-04** More than 25 posts → "Load more".
- [ ] **POST-05** Phone: each row keeps the text and status, with the time under the text.
- [ ] **POST-06** Repeating posts: the original says "Repeats"; its copies say "From a repeating post".
- [ ] **POST-07** The tab and label filter are kept in the address and after a reload.

## Labels
- [ ] **POST-10** **Manage labels** (editor and above): add a label (colours offered in turn), rename in place (Enter or leaving saves, Escape undoes), change its colour, delete (the confirmation says how many posts carry it).
- [ ] **POST-11** A name already used (in any letter case) is refused with an explanation.
- [ ] **POST-12** Label filter in the header → only those posts; it stays when switching tabs; an empty filtered list offers "Show all labels".
- [ ] **POST-13** On a post's page, add or remove a label → saved at once, also on a published post.
- [ ] **POST-14** As viewer: labels are visible but can't be changed.

## A post's page
- [ ] **POST-20** Status, author, created time; the content (text, files, link, first comment), then each network's own version.
- [ ] **POST-21** Each account's delivery as a card: status, published time and "View on <network>" (opens the post on the network).
- [ ] **POST-22** Each card's history: attempts in order, open when the delivery failed.
- [ ] **POST-23** A post being sent: the status changes on screen by itself (scheduled → publishing → published) (two tabs, or watch it).
- [ ] **POST-24** Times are in the workspace's time zone; hovering shows yours.
- [ ] **POST-25** A repeating post's page says how it repeats and when next; a copy's page says it's a copy.

## Failures and retry (real network)
- [ ] **POST-30** A failed delivery says why in plain words (sign-in, content, rate limit, network unreachable), quotes the network's own message and code when it sent one, and offers the fix:
  - **Retry** (editor and above),
  - **Reconnect account** (sign-in problems; opens the account),
  - **Edit post** (content problems, while the post can still change).
- [ ] **POST-31** Retry → a new attempt in the history; success turns the card green.
- [ ] **POST-32** The sidebar's Posts count goes down when failures are fixed.

## Actions
- [ ] **POST-40** **Edit** (author, or editor and above) → the composer; not offered once anything has gone out.
- [ ] **POST-41** **Duplicate** → the copy opens in the composer as a new draft (accounts that were disconnected and deleted files are left out).
- [ ] **POST-42** **Delete** a draft → gone. Delete a scheduled post → its scheduled deliveries are cancelled. Not offered once anything has gone out.
- [ ] **POST-43** As contributor: Edit and Delete only on your own posts.

## Not built yet
Bulk actions, more filters (account, author, dates), comments, approval history and tasks (phase 4).
