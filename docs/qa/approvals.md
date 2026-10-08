# QA: approvals

As of 2026-10-08 · For the QA team · Screens: [approvals](../frontend/areas/approvals.md)

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

## Not built yet
Comments on the review panel, keyboard shortcuts (J/K, A, R), notifications to the author (phase 4).
