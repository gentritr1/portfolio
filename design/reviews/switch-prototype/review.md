# Fresh review: / (CURRENT, anchor) vs /switch (PROTOTYPE)

| page | Straight | Proof | Original | Hook | Type+colour | total | gate |
|---|---|---|---|---|---|---|---|
| CURRENT `/` | 8 | 8 | 7 | 7 | 7 | **37/50** | pass (1440 + 390 only) |
| PROTOTYPE `/switch` | 7 | 8 | 8 | 7 | 7 | **37/50** | pass (1440 + 390 only) |

Neither page reaches the ship target (42 with original and hook at 8 or more). Tie on total; they differ in where the points come from: CURRENT wins the first screen, PROTOTYPE wins the scope idea.

Reviewer: fresh agent, 2026-11-02. Did not read layers.md, review-round1.md, *-output.txt, rules-tap-*.txt, git log messages or src/. Section 1 was written from the four captures only, before any other evidence, and is unchanged.


## 1. First-screen comprehension (from captures only, written before any other evidence)

### CURRENT, 1440
- Who: "Gentrit Rashiti" (nav) + "Software engineer: frontend, backend and mobile"
- What: "I build web and mobile products, from interface to backend."
- For whom: "Mostly for healthcare teams, learning platforms and consumer apps."
- Proof: Offday product screenshot with "Interface / Server rules / Data" switch; "Own product, a working MVP built with one other developer"; "5+ years shipping web and mobile products"; four project rows visible (Care platform "Web + backend", Bayyinah TV "Frontend · streaming, English + Arabic", Tondo + LeakScan "Backend · realtime servers, scan jobs", Read to Feed "Mobile · about 14 store releases").
- Memory: "A Kosovo-based engineer who builds web, mobile and backend, with his own team-leave app Offday and four named projects right underneath."

### CURRENT, 390
- Who: "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- What: "I build web and mobile products, from interface to backend."
- For whom: "Mostly for healthcare teams, learning platforms and consumer apps."
- Proof: "Offday, a working MVP built with one other developer." + a calendar screenshot (no app name visible in the shot) + the switch row at the fold edge. "5+ years". No project rows above the fold.
- Memory: "Full-stack/mobile engineer in Kosovo, shows a calendar app he built with one other dev."

### PROTOTYPE, 1440
- Who: "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- What: "I build web and mobile products, from interface to backend."
- For whom: "Mostly for healthcare teams, learning platforms and consumer apps."
- Proof: "Offday" heading, "Own product, a working MVP built with one other developer", "About 200 Playwright tests / Including security and tenant isolation.", a three-row ledger "Interface: Team requests, approvals and a shared calendar." / "Server rules: Roles and organization membership are checked on the server." / "Data: SQLite stores workspaces, requests and balances." No other project visible above the fold (no project rows).
- Memory: "He built Offday end to end, interface, server checks and database, with about 200 tests."

### PROTOTYPE, 390
- Who: "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- What: "I build web and mobile products, from interface to backend."
- For whom: "Mostly for healthcare teams, learning platforms and consumer apps."
- Proof: "Offday / Own product, a working MVP built with one other developer" + "About 200 Playwright tests / Including security and tenant isolation." + top of the calendar screenshot.
- Memory: "Engineer who shipped Offday with about 200 Playwright tests."

Note added after step 2 (does not revise the above): the live 1440 first screen of `/` matches the capture (four project rows above the fold). On `/switch` the first screen at 1440 shows no project other than Offday; the next one (care platform) starts at about y=590 of the second screen. At 390, `/` names only Offday above the fold, so "proof" there is one product with no title over its screenshot.

## 2. Evidence used

Observed (executed):
- Text of both pages dumped from a production build at 1440 (playwright-core + Chrome), compared line by line with CONTENT.md.
- Live drive at 1440 and 390 (touch context at 390): clicked "Server rules" on the Offday switch with the pointer, then focused it and pressed ArrowRight; tabbed 14 stops from the top. Both pages: the layer controls are `button[aria-pressed]`, 44 px tall on `/` and 74-122 px rows on `/switch`; focus ring 2 px solid on both; ArrowRight does not move between layers on either page (Tab does), which is acceptable for toggle buttons.
- `/switch` "Server rules" shows Offday's own privacy screen ("Only Sofia and her managers can read this"; "Teammates see the dates on the calendar, not the note."), matching CONTENT §11.
- Opened `/offday` from `/switch` (H1 "Time off, without the back-and-forth.") and went back: scroll restored to 18 px (from 0). Opened `/care-platform` from y=1336 and went back: restored to 1336.
- check.mjs on both, fresh runs at 16:52 UTC (an older `chk-switch` report from an earlier session sat in the same scratch folder and showed a C01 fail; I discarded it after checking the file time and re-reading the fresh report).
  - `/`: PASS, 0 hard fails. Warnings: T10b (2), T10f technical words (11), T30 middot chains (2), T00 template total 2, C08c two reading images under 2x. Work in first screen 34% (1440) / 40% (390); sizes 16/20/40/56; one long frame of 1015 ms at 390 (headless, indicative).
  - `/switch`: PASS, 0 hard fails. Warnings: T10b (2), T10f (10). Work in first screen 32% (1440) / 28% (390); 89 words at 1440 (C02 warns above 90); sizes 16/20/40/56 and 16/20/28/36.
- Full-page side-by-side capture read at reduced size only (the 1480x6120 jpg is unreadable at that scale); section detail came from my own live screenshots.

Not done (gate caveat): 768, 1024 and 1280 widths were not tested, nor reduced motion by eye (the checker reports reduced-motion rAF 0/s on both). The gate "pass" covers 1440 and 390 only.

## 3. Scores

### CURRENT `/` (anchor) — 37/50, gate pass (1440/390)
- Straight 8: at 1440 all four answers plus four named project rows with scope ("Backend · realtime servers, scan jobs", "Mobile · about 14 store releases") sit above the fold; at 390 the proof shrinks to one unnamed screenshot and "Offday, a working MVP built with one other developer."
- Proof 8: rows state scope; "Before and after" gives two checkable, sourced results (16 → 2 queries; 186,949 → 6,386 bytes); 100K+ downloads labelled as product reach. Seniority from nouns is partial (no team size or decision scope on the first screen).
- Original 7: a real product with an Interface / Server rules / Data switch is a noticed detail, but the composition is the loop skeleton (headline left, screenshot right, one gimmick), and the rest of the page is a long selected-work + index pattern.
- Hook 7: memory sentence carries a fact (Offday, three layers), but the switch is one of many things on a 12,129 px page; nothing a visitor would retell beyond "he showed his app's server rules".
- Type+colour 7: one family (Archivo), tinted near-black ground rgb(5 5 8), one cyan accent; correct and calm, not a mood-board setting.

### PROTOTYPE `/switch` — 37/50, gate pass (1440/390)
- Straight 7: four answers are there, but the first screen is text-heavy (89 words) and Offday is the only work named; the eye lands on the headline and the ledger, not on the screen. At 390 the screenshot is cut at the fold (28% work).
- Proof 8: each of seven projects carries a quoted role line, one checkable result and a per-layer scope; "About 200 Playwright tests, including security and tenant isolation" is a strong, sourced fact. Held back from 9 by the role quotes that do not match the source (see accuracy) and by results that read as personal when the source is team voice.
- Original 8: "Each project shows only the layers its role covered. The others are named, not claimed." is a decided rule specific to this person's interface-to-backend claim; I cannot name a site it copies. Not 9: the page layout under it (title, meta, ledger, screenshot right) is still the loop skeleton repeated seven times.
- Hook 7: memory sentence is factual ("built Offday end to end, interface, server checks and database, with about 200 tests"), but by the fourth project the repeated "Not in this role" rows (8 of them, plus 2 "None") become what is remembered: a visitor may retell "mostly frontend and mobile".
- Type+colour 7: same system as `/`; the hollow/filled/dash layer markers are a neat typographic device, but the setting is not one anyone would screenshot.

## 4. Factual accuracy (checked against CONTENT.md, its owner rules, and the pages' own text)

Layer claims per project on `/switch` (observed): Offday I/S/D all claimed; Care platform I + S claimed, Data "Not in this role; the report fix was in the API"; Bayyinah TV I only; Read to Feed I only; Design System v2 I only, S/D "None: a component library"; Viva Fresh I only; Tondo I/S/D; LeakScan I/S/D. On `/` the layer switch exists only for Offday; rows are labelled "Web + backend" (care), "Frontend" (Bayyinah), "Backend" (Tondo + LeakScan), "Mobile" (Read to Feed). All of these agree with the CONTENT roles, except as listed:

1. **`/` "Explore the product layers — Eight products, from interface to infrastructure."** CONTENT §0: "Do not add C#, Angular, infrastructure ownership…". "Infrastructure" contradicts the owner rule. (Absent on `/switch`.)
2. **Care platform Data, `/switch` vs the shared About.** The care row says Data is "Not in this role", but the About section on the same page says "Since 2026, my work also includes Laravel APIs, database reports and permissions", and the row's own headline result is a database-query change (16 → 2). The page contradicts itself; CONTENT does not split the report fix into "API, not data". Pick one reading and use it on both.
3. **16 → 2 attribution (both pages, stronger on `/switch`).** CONTENT gives it in team voice ("The Laravel backend gained…; one billing report went from 16 queries to 2"). `/switch` sets it directly under Role: "since 2026 also the server", which reads as his personal fix; `/` sources it "from its commit history" in "Before and after". Neither says it was his; neither says it was the team's. Inference: a screener will read it as his.
4. **Quoted role lines that are not the source's words (`/switch`).** Quotation marks imply a citation, but: Bayyinah “Frontend, on the core team of the rebuild.” (CONTENT: "Frontend, core team"); Read to Feed “Mobile developer, iOS and Android.” ("Mobile, iOS and Android"); Viva Fresh “Mobile developer.” (index: "Mobile"); Design System v2 “Frontend developer on the team that builds it.” (CONTENT role: "Design system"; owner: team credit, no individual credit). Only the care quote matches exactly.
5. **Viva Fresh "Shipped grocery shopping on iOS and Android." (both pages).** CONTENT supports a 2023 mobile contribution and says the 100K+ downloads are "not … installs attributable to the owner's 2023 contribution". A subjectless "Shipped" next to 100K+ reads as shipping the app. Same voice issue, milder, in "Rebuilt a live learning platform." and "Kept a children's reading app shipping…" (voice rule: team projects take "the team" as subject).
6. **Care tenants claim (`/switch` Server rules plate).** "Each organization's records stay out of every other organization's responses." CONTENT supports "multi-tenant security fixes" and "tenant boundaries", not a whole-API guarantee; also "Tests on Pest, against MySQL and Redis" is not in CONTENT (Pest, MySQL, Redis appear only as stack).
7. **Tondo details not in CONTENT (`/switch`), UNVERIFIED.** "Reuses Za!'s multiplayer server", "a one-tap game against three of them", "Requests limited per real client address", the four table names, "Leaving a crew clears the name, its only copy". The repo is public and CONTENT cites `server/clientip.js` and a test inventory, so these may be true; there is no Tondo case page to check against and I did not read the repo.
8. **Client screenshots (both pages).** The care platform figure is captioned "Real product screens, invented data", while CONTENT §2/§9 say "Live recreation (invented data, no brand)" and the footer line "No screenshots of client work". A later owner decision may cover this; it is not in CONTENT. Owner to confirm.
9. **Offday per-person split (`/switch`).** The rule "Each project shows only the layers its role covered" claims all three Offday layers for Gentrit; CONTENT says co-built with one other developer and gives no split. The credit line beside it ("built with one other developer") keeps this honest, but the rule's wording overreaches slightly.

Everything else checked matches: 5+ years, Kosovo/remote, audience line, Offday tables and the org_id caveat, "About 200 Playwright tests", LeakScan (7 checks, 4 free, 14-day expiry, read-only access, pre-launch, built alone), 100K+ labelled as product reach with date, 41 components / 22 releases in 60 days / 186,949 → 6,386 bytes, the exact AI team line, About mentoring paragraph.

## 5. Which page for which screen (inference)

For a full-stack screen, show CURRENT: its first screen names a backend row (Tondo + LeakScan) and a "Web + backend" row before any scroll, while PROTOTYPE makes the screener read past 8 "Not in this role" rows to find the three projects with server and data. For a frontend screen, CURRENT again: Bayyinah TV, Read to Feed and the design system are visible or one scroll away, and PROTOTYPE's dashes add nothing a frontend screener needs. PROTOTYPE's honest per-layer scope is the stronger interview artefact, so its rule belongs on case pages or a "how the work splits" view, not as the home's main sorting device.

## 6. Devil's advocate

**CURRENT.** The hiring manager sees the loop skeleton (big sentence, screenshot right, a three-tab gimmick) and a 12,000 px page that repeats every project twice (selected work, then the index). The headline promises "interface to backend", but the backend proof is two personal projects plus one team report fix, and "Eight products, from interface to infrastructure" overclaims in a way an interviewer will probe ("what infrastructure did you run?"; CONTENT says observed EC2, little deployment). On a phone the first screen shows a calendar with no product name above it, so a 5-second skim leaves "some calendar app". Closes the tab because nothing says senior: no decision with a size, no team he led.

**PROTOTYPE.** The first screen is a wall of 89 words and a ledger, and the only product above the fold is a co-built MVP with no users. Scrolling, the page's most repeated phrase is "Not in this role": a screener for a full-stack job counts the dashes and concludes he is a frontend/mobile developer with side projects, which is the opposite of the headline. The quoted role lines do not match any source, so a careful reader who opens the CV will find different wording. The "Data: not in this role" on the care platform, next to a database-query result and an About that says "database reports", reads as either false modesty or confusion. Closes the tab because the page argues against its own headline.

## 7. Fix lists (most severe first)

### CURRENT
1. Remove "from interface to infrastructure" from the "Explore the product layers" link (owner rule, §0); say "from interface to server" or name the products.
2. Phone first screen: put the product name ("Offday") above the screenshot, not only in the status sentence; today the 390 proof is an unnamed calendar.
3. Give team credit for the 16 → 2 report in "Before and after" ("The team's API change…"), or confirm with the owner that it was his and say so in the role line.
4. Viva Fresh "Shipped grocery shopping on iOS and Android." → a team or contribution sentence (2023 mobile work), and keep 100K+ visibly separate from his contribution.
5. Cut the duplication between Selected work and All projects (the index repeats every selected row); the page is 12,129 px.
6. Middot chains (T30) on the Tondo and LeakScan meta lines; two reading images below 2x density (C08c).
7. Owner to confirm that care-platform screenshots ("Real product screens") override CONTENT's "no screenshots of client work".

### PROTOTYPE
1. Fix the self-contradiction on the care platform: either count the report fix as Data (it is a database-query change) or change the About's "database reports"; then make every row agree with the About.
2. Replace quoted role lines with the CONTENT roles verbatim, or drop the quotation marks; remove the individual "Frontend developer on the team that builds it" from Design System v2 (owner: team credit only).
3. Cut the "Not in this role" repetition: show the claimed layers and drop rows that are not claimed, or collapse them to one muted line; 8 negative rows on a page titled "from interface to backend" sink the hook.
4. Put a second and third project on the first screen at 1440 (the current page's four rows show how), and get first-screen words under 80.
5. Soften "Each organization's records stay out of every other organization's responses" to the sourced "tenant boundaries / security fixes"; drop "against MySQL and Redis" unless sourced.
6. Source or remove the Tondo details not in CONTENT ("Reuses Za!'s multiplayer server", "one-tap game against three of them", "Leaving a crew clears the name, its only copy").
7. Viva Fresh and the other subjectless "Shipped/Rebuilt/Kept" headlines: same voice fix as CURRENT item 4.
8. Reword the section rule so it does not claim a per-person split on co-built Offday ("layers the project covered; co-built where noted").
