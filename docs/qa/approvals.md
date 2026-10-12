# QA: approvals

As of 2026-10-12 · For the QA team · Screens: [approvals](../frontend/areas/approvals.md)

## Review queue (editors, admins, owners)
- [ ] **APR-01** The sidebar shows **Approvals** with a count of posts waiting; it changes as posts are sent for review or decided, without reloading.
- [ ] **APR-02** Waiting: posts in review, the longest-waiting first, with who sent them and when. Decided: posts approved or sent back, newest first.
- [ ] **APR-03** Click a post → a panel with its previews per network, the sender's note, and the review so far.
- [ ] **APR-04** **Approve** → toast; it leaves Waiting and shows under Decided; the author can now have it scheduled.
- [ ] **APR-05** **Approve & schedule** → pick a time → it's approved and scheduled; it's on the calendar.
- [ ] **APR-06** **Request changes** → "Send back" stays disabled until a note is typed → the post is a draft again, with the note shown to its author.
- [ ] **APR-07** When the workspace reviews every post, approving your own post says someone else needs to approve it.
- [ ] **APR-08** Two reviewers on the same post: the second one is told it isn't waiting any more.
- [ ] **APR-09** On a phone, the panel opens as a sheet from the bottom.

## My submissions (contributors)
- [ ] **APR-20** Approvals shows "My submissions": your posts in review, approved or scheduled; a row opens the post in the composer.

## Comments (review panel and the post's page)
- [ ] **APR-30** The review panel and the post's page show **Comments** with their count; "No comments yet" when there are none.
- [ ] **APR-31** Write a comment and press **Comment** (or Ctrl/⌘+Enter) → it appears at the end with your name and "now"; the box empties.
- [ ] **APR-32** Type "@" → a list of the members who can see the post; typing narrows it by the start of a name ("ma" finds Marco, not Priya Raman); arrows and Enter pick → "@Marco Alves" in the text, marked in the posted comment. Escape closes the list.
- [ ] **APR-33** **Reply** under a comment → the reply sits indented under it. Replying to a reply adds to the same thread (one level only).
- [ ] **APR-34** Your own comments have a menu: **Edit** changes it in place ("edited" shows); **Delete** asks first. A comment with replies stays as "Comment deleted"; one without goes. Others' comments have no menu.
- [ ] **APR-35** As a viewer: you can read and write comments.
- [ ] **APR-36** Two browsers on the same post: a comment in one appears in the other without reloading.
- [ ] **APR-37** A member limited to other accounts (Settings → Members → accounts) isn't in the "@" list, and can't open the post.

## Notifications
- [ ] **APR-40** A contributor sends a post for review → editors, admins and owners who can see it get "<name> sent a post for review" in the bell (and an email); it opens the review panel on that post. The sender, viewers and members limited to other accounts don't.
- [ ] **APR-41** Approve it → its author gets "<name> approved your post"; request changes → "<name> asked for changes to your post". Both by email too; the email doesn't quote the note.
- [ ] **APR-42** A comment on someone's post → its author gets "<name> commented on your post", and earlier commenters "<name> commented on a post you commented on" (in the app only). Opening it scrolls to the comment and marks it.
- [ ] **APR-43** "@" someone → they get "<name> mentioned you in a comment" (and an email) instead of the comment notice. Editing a comment to add a mention notifies only the newly mentioned.
- [ ] **APR-44** You never get a notification for your own action.

## Not built yet
Keyboard shortcuts (J/K, A, R), the review emails' own designs (phase 4).
