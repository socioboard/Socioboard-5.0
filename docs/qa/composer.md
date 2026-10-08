# QA: composer

Area doc: [composer](../frontend/areas/composer.md) · Checks for every screen: [README](README.md#every-screen)

The most important screen: write once, tailor per network, see how it will look, then publish, schedule or queue.

## Choosing accounts
- [ ] **COMP-01** New post → "Post to" shows every account by network; click one to choose it (a tick), again to unchoose.
- [ ] **COMP-02** An account that's paused or needs reconnecting is shown but can't be chosen; hovering says why.
- [ ] **COMP-04** With account groups saved: they show as chips above the accounts. A chip chooses the group's accounts that can post (its count says how many); once all of them are chosen it shows a tick, and clicking it again unchooses them. A group none of whose accounts can post can't be clicked; hovering says why.
- [ ] **COMP-03** No accounts connected → a line pointing to the Accounts page (for admins), and only Save draft.

## Writing
- [ ] **COMP-10** Type text → each chosen network shows its own counter (e.g. "81/280" for X); going over turns it red and the issue appears.
- [ ] **COMP-11** Tabs: "All networks" plus one per chosen network; the chosen tab is clearly marked in light and dark; arrow keys move between tabs.
- [ ] **COMP-12** On a network's tab, typing makes that network's own text (a dot marks the tab); the other networks keep the shared text; "Reset to shared" brings it back.
- [ ] **COMP-13** Media on a network's tab: "Use different media for <network>" → that network gets its own files; Reset brings the shared ones back.
- [ ] **COMP-14** Unchoose a network → its tab and its own content go away.
- [ ] **COMP-15** Link field: a non-web address is flagged when you leave the field; a web address is accepted.
- [ ] **COMP-16** First comment and Labels are on "All networks"; labels can be added and removed.

## Media
- [ ] **COMP-20** Upload from the composer → each file attaches as soon as it's stored, with progress; several keep the order picked.
- [ ] **COMP-21** "Choose from library" → pick files in order; ones already attached are marked.
- [ ] **COMP-22** Remove a file, and "move earlier" to reorder.
- [ ] **COMP-23** A file still processing shows "processing", and the "still being processed" issue clears by itself when it's ready (no edit needed).
- [ ] **COMP-24** A file deleted from the library shows "This file was deleted".

## Preview
- [ ] **COMP-30** The preview sits beside the editor on a laptop (and stays in view while scrolling); on a phone, an "Edit / Preview" switch.
- [ ] **COMP-31** It updates as you type, with the account's real name and picture; with several accounts of one network, "Preview as" picks which.
- [ ] **COMP-32** **Facebook:** Page name, "Just now" and the globe; long text cut with "See more" (which expands); photos in Facebook's grid; a link card when there are no photos; Like / Comment / Share; the first comment underneath.
- [ ] **COMP-33** **Instagram:** media first, then the bold username and the caption cut with "more"; several files as a swipeable carousel with "n/N"; reel and story in a tall phone frame; a story shows no caption and says so; no media → "Instagram posts need a photo or video".
- [ ] **COMP-34** **X:** name, @handle · now; the whole text, with the link added after it; one photo in its own shape (a wide banner shown whole), 2–4 photos in X's grid; a link card ("From <site>") when there's no media; X's action row.
- [ ] **COMP-35** Instagram tab: feed / reel / story choice; the preview changes with it.
- [ ] **COMP-36** **Threads:** username and "now"; the whole text; one photo in its own shape, several side by side (scroll sideways); a link card when there's no photo, else the link at the end of the text; the first comment shown as a reply.
- [ ] **COMP-37** Threads tab: **Who can reply** (Anyone, Profiles you follow, Your followers, Mentioned only); the post on Threads has that setting.
- [ ] **COMP-38** A video in the preview: its poster with a play button once processed; pressing it plays the video in place, with sound and the browser's controls. While still processing, only the poster.
- [ ] **COMP-38L** **LinkedIn:** your name and picture, "Just now" and the globe; long text cut after three lines with "…more" (which expands); the link added after the text as plain text, with no link card (LinkedIn doesn't make one for apps); one photo in its own shape, two side by side, three as one above two, four or more as one above three with "+N"; a video alone, which plays in place from its play button once processed; Like / Comment / Repost / Send.

## Checks before publishing
- [ ] **COMP-40** "Before you publish" lists problems: errors (they block that network) before notes (they don't); "Ready to publish" when there are none.
- [ ] **COMP-41** Clicking a problem takes you to its tab and field (e.g. the X tab's text).
- [ ] **COMP-42** A network with a problem has a red mark on its tab.
- [ ] **COMP-43** Examples to try: text too long for X; 5 photos on X ("up to 4"); a GIF plus a photo on X ("a GIF or a video goes alone"); a link on X (note: "X charges more for posts with a link"); Instagram with no photo; a link in an Instagram caption (note: not clickable); on LinkedIn, a photo and a video together ("can't mix photos and videos"), two videos ("up to 1"), 21 photos ("up to 20"), a video shorter than 3 seconds.
- [ ] **COMP-44** Network down or the server slow → "Checking…", then the quick checks stay with a note.

## Saving
- [ ] **COMP-50** **Save draft** → "Saved at 14:05"; the address gets the post's id; you stay in the composer.
- [ ] **COMP-51** Keep typing → "Unsaved changes", then it saves by itself within 10 seconds.
- [ ] **COMP-52** Leave with unsaved changes (another page, or close the tab) → "Leave without saving?".
- [ ] **COMP-53** Reopen a draft from Posts → everything is back: text, each network's own text and media, Instagram format, link, first comment, labels.
- [ ] **COMP-54** Save fails (network off) → "Didn't save." with the reason and "Try saving again".

## Publish now (real network)
- [ ] **COMP-60** Choose accounts, fix any problems → **Publish now** → a toast says how many accounts it's going to → the post's page opens and shows each account's progress.
- [ ] **COMP-61** Publish now is disabled while no account is chosen or a network has a problem, with the reason beside it.
- [ ] **COMP-62** Double-click Publish now, or click it twice fast → the post goes out once.
- [ ] **COMP-63** Opening a published post → read-only, with a link to its page.
- [ ] **COMP-64** As contributor: no Publish now, Schedule or Add to queue; Save draft and a line saying who sends it out.
- [ ] **COMP-65L** **LinkedIn** (keep test posts few: LinkedIn caps posts from members who haven't verified their identity, and then the post fails saying so): publish (a) text with brackets, an underscore and a hashtag, e.g. `QA (test) [ok] a_b #socioboard`, plus a link in the Link field; (b) one photo with alt text; (c) three photos; (d) a video, MP4 and one MOV from a phone. Each appears on your LinkedIn profile as written: no backslashes, nothing cut off, the link and hashtag clickable, photos in order; the post's page links to it.

## Schedule
- [ ] **COMP-70** **Schedule** → a calendar and a time, in the workspace's time zone ("Times are in Kolkata time"), starting about an hour from now.
- [ ] **COMP-71** The sentence under it says when it goes out (and your own time when your computer is elsewhere); days in the past and over a year ahead can't be picked; a time under 2 minutes away is refused.
- [ ] **COMP-72** Schedule → toast with the time → the post's page; it's on the calendar at that time.
- [ ] **COMP-73** Reopen a scheduled post → "Goes out …" with **Unschedule**; the footer is Save changes, Reschedule, Publish now; there's no autosave (changes go out only when saved).
- [ ] **COMP-74** Unschedule → it's a draft again; what you typed stays.

## Repeat
- [ ] **COMP-80** In the Schedule dialog, Repeat: daily, weekly (pick weekdays), monthly (that day's number, or the last day); every 1–12; ends never, on a date, or after N times. The sentence reads it back ("Every 2 weeks on Monday and Thursday at 09:00, 8 times").
- [ ] **COMP-81** Save a repeating post → the post says how it repeats and when next; copies appear on the calendar; Publish now and Add to queue aren't offered.
- [ ] **COMP-82** **Stop repeating** asks first, then removes the copies that haven't gone out.
- [ ] **COMP-83** A copy made by a repeating post says so and can't itself repeat.

## Add to queue
- [ ] **COMP-90** With posting times set for the chosen account → **Add to queue** → it takes the next free time; the toast says when.
- [ ] **COMP-91** Two accounts chosen, one without posting times → Add to queue is disabled and names that account.
- [ ] **COMP-92** From a free queue slot's "Write a post" → the composer opens with that time and account chosen.

## Review
- [ ] **COMP-100** As a contributor (or anyone, when the workspace reviews every post): no Publish now, Schedule or Add to queue; **Submit for review** instead, disabled until accounts are chosen and problems fixed. Submit → toast; the post shows "Waiting for review".
- [ ] **COMP-101** Waiting for review: the author can still edit, and **Take back** makes it a draft again; an editor opening it sees **Review it**.
- [ ] **COMP-102** Sent back: the draft shows "… asked for changes" with the reviewer's note; Submit for review is offered again.
- [ ] **COMP-103** Approved: an editor sees Publish now and Schedule again. A contributor editing it sees "Changing it sends it back for review"; saving a change puts it back in review and unschedules it.

## Not built yet
Options panels for Pinterest, YouTube and TikTok and their previews (phase 3, with each network), Shorten link (phase 3, Bitly), Generate with AI (phase 4).
