# Round 7: devil's advocate (projector, sampled-ground, sampled-frame)

Evidence used: `thumbs7/*.png` (1440 × 900), `reel7/shots/*` (540 × 960 at 2x), `loop7/<id>/final/*`, and new live captures and DOM measurements in `scratchpad/devil7/` (desktop 1440 × 900 and phone 375 × 812 and 540 × 960, dev server :5240, captured 2026-10-05 after the last source edit). Contact sheets: `devil7/pj-grid.png`, `devil7/sg-grid.png`, `devil7/sf-grid.png`. Facts were checked against `CONTENT.md`, `src/content/projects.ts` and `src/content/caseNarratives.ts`.

One objection applies to all three drafts. Put it first.

**All three open on internal tooling or on the oldest, smallest work.** Projector and sampled-frame open on Design System v2. CONTENT.md §6 says the dashboard that uses it "is not in production yet". A founder who clicks "Open the case" learns that the first exhibit has no users. Sampled-ground opens on a 2023 grocery cart (a jar of ajvar). No draft opens on a shipped product with users and a real problem solved. The strongest problem-and-result line in the whole content set is "One billing report ran 16 queries and timed out. → 2 queries, no timeout". It is projector row 03 and has no screen. It is a record row in sampled-ground and it is absent from sampled-frame.

**All three hide who did the work.** `projects.ts` says "The team defined 805 design tokens … and shipped 36 components". Projector row 01 says "36 components, 805 tokens, 20 releases in about six weeks" with role "Design system". It does not say team or solo. A peer reads sole authorship, then the case page says "the team". That is a credibility hit at the first exhibit.

---

## 1. Projector (live home page at "/")

### First 10 seconds

- **Hiring manager (product company).** Reads "Gentrit Rashiti builds web and mobile products, from the design system to the API behind them." Good. Then the biggest object on the screen (880 × 676 px) is a table of `cobalt.600 → action.primary → button.solid.bg`. They do not know what a token is. The highlighted result "36 components, 805 tokens, 20 releases in about six weeks" is three numbers with no problem attached. Why they leave: the first exhibit looks like a settings panel, not a product. They see no product a customer uses until row 04 (scroll position about 2,000 px).
- **Startup founder.** Wants "can he ship my app alone?". Row 01 is a design system for a product that is not live. Row 02 is a recreation with invented data. Rows 03 and 09 are giant numerals on white paper. The first real public screen is row 04, bayyinah.org, and its result is "Live, with links to both app stores". That is two store badges, not an outcome. Why they leave: 4 rows in, they still have not seen a shipped thing with a result that matters to a business.
- **Design-engineer peer.** Sees a sticky frame beside a scrolling numbered log with a slide tray. Known on sight. Then counts the "current row" signals: the numeral fills, the result gets an ink band, the tray slot fills, the hairline draws, the plate cross-fades. That is five marks for one state. Why they leave: competent scrollytelling with the motion budget spent on telling them "this row is current" four times over.

### Generic or already seen

- Sticky media frame beside a scrolling text column: scrollytelling, as on The Pudding, NYT graphics and Apple product pages. The builder admits it (`holdback`: "a known scrollytelling layout").
- 96 px condensed outlined numerals that fill when active, plus a "01 … 10" pagination tray: the numbered-index look of many Awwwards studio sites. On phone the page shows "01 / 10" and then a 64 px "01" 50 px under it. That is the same index two times.
- Pale chartreuse #D9F26B ground with black ink: the 2024 "brat green" wave. It is memorable for one week, then it dates the page.

### Unclear, too technical, or filler (exact lines)

- "One source of design tokens, in three tiers, for CSS, TypeScript and Figma." A hiring manager understands none of: tokens, tiers, TypeScript.
- Plate labels `button.solid.bg uses action.primary, which is cobalt.600.` This is the first image on the page.
- "Vue to React, parity-tested · 2023–26". "Parity-tested" is house jargon. The year range is also wrong for the claim: the React move is 2026 (CONTENT.md table: "Care-management platform, React rewrite | 2026"). 2023–26 is the Vue app.
- "Live, with links to both app stores" (row 04): a filler result. Any page can link two badges.
- "One reusable React Native package, ported to the web" with a plate that is the digit "1" and the word "PACKAGE" (row 09, `pj-grid` bottom-middle). The frame shows nothing.
- "Sign people in to an on-chain wallet. Teammates built the wallet layer." Honest, but the second sentence spends the line on what he did not do.

### Claims a reader could doubt

- "36 components, 805 tokens, 20 releases in about six weeks": supported by CONTENT.md §6 "Allowed facts". It is a team result (`projects.ts`: "The team defined …"). The row does not say so.
- "Stripe, Apple and Google subscriptions" (row 06): supported by CONTENT.md §3. The ring is on the Monthly/Annual switch of the pricing page. That pixel proves a billing period toggle, not three payment providers.
- "Shopping in Albanian, live in both stores" (row 07): the builder admits no pixel proves "both stores"; the caption carries it.
- "2 queries, no timeout": supported (CONTENT.md: "Report query 16 → 2, no more timeouts").

### Visually weak

- Desktop first screen, measured: the frame is 880 × 676 at x 520 y 83. The opening plate leaves white bands inside the card (Tokens header at y 136, first row at y 321; about 110 px of empty card between them; the One source row sits alone under another ~60 px gap).
- Phone 375 (`devil7/p/pj-m-top.png`): the plate shows one token row only (`cobalt.600` / `action.primary` / `button.solid.bg`) and the ringed "One source" box wraps `figma.json` to a second line inside the ring. The work on the phone first screen is a config row.
- The result highlight breaks badly: desktop "…20 releases / in about six weeks" (second band 192 px wide under a 440 px band); reel shot `projector-1.png` leaves the single word "weeks" on its own band; phone 375 breaks "20 / releases".
- Two of ten frames are numerals on white paper (rows 03 and 09). Viva Fresh stands on white with 208 px of paper at each side; Incentiv has about 165 px of dark ground above and below a small sign-in card; the passkey ring is about 40 × 15 px at 1440 (`pj-grid` row 05).
- The hairline on phone runs in the 16 px gutter at x ≈ 5 px (`projector-1.png`, x 15 of 1080 at 3x), down past the caption and the section rule. It reads as a stray border, not a pointer.

### The single change

Open on a shipped product and a plain problem. Make row 01 a public, live screen (Bayyinah TV, "Rebuilt on Nuxt 3: live chat, subscriptions, 34 routes") or give the 16 → 2 query fix a real screen and lead with it. Move the design system to row 3 and rewrite its line for a non-engineer: "One set of colours, sizes and parts feeds the code and the Figma file, so design and code stay the same." Say "with a team of N" if that is the truth. Cut rows 04 and 09 (no-outcome results and a blank numeral plate): 8 rows, every frame shows work.

### Radical alternative

Drop the 10-row log. Show three exhibits only, each as a before/after the visitor flips in the frame: 16 queries → 2 (a report screen that loads), one organization → another (the care recreation hides the other tenant's patients), Vue screen → React screen (same route, two apps). The motion then explains a change, which is the brief's rule 4, instead of marking "current".

---

## 2. Sampled-ground

### First 10 seconds

- **Hiring manager.** The first thing they read is a thin mono bar: "hue 0° … 360°" and "Sampled from the screen under it · Viva Fresh · 23°". That looks like a colour picker from a design tool. Then the 64 px headline "Two platform rewrites, three apps in both stores." The name is in a 20 px line under it. Then a large jar of ajvar at 1.69 € and a red "VAZHDO ME PAGESEN" button. Why they leave: the first work is a small grocery cart in a language they cannot read. It does not say "senior".
- **Founder.** The headline is good bait for them: rewrites and store apps are what they hire for. Then the result "One checkout, in Albanian, in both stores." Every store app has one checkout. That is a description, not an achievement. They scroll: Bayyinah TV is a recreation with invented data, Incentiv is a recreation, design system is a recreation, care is a recreation. 4 of 6 cards are recreations; only Viva Fresh and bayyinah.org are real pixels. Why they leave: "I see mock-ups, not shipped products."
- **Design-engineer peer.** Sees the page change colour per section, and a large saturated panel per project with a screenshot on the left and text on the right. The sampling story is clever, but it is told by a 12 px mono label, and it is only proven when the second ground spreads below the first screen (builder admits this in `holdback`). Why they leave: "colour-per-project card stack, with a hue readout to justify it."

### Generic or already seen

- Section background colour that changes on scroll: a standard GSAP ScrollTrigger demo pattern, on many Awwwards studio sites.
- Big saturated project card, screenshot left, text right, one per project: the default project block of Framer portfolio templates.
- The hue slider bar: a colour-picker control repurposed as navigation. Peers will read it as a gimmick that explains itself.

### Unclear, too technical, or filler (exact lines)

- "hue 0°", "360°", "Sampled from the screen under it · Viva Fresh · 23°", "hue 23°" (shown again inside the card), and on phone "Viva Fresh · hue 23°". Four places that print a hue number. A hiring manager gets nothing from any of them.
- "The colour of this page is sampled from the screen under it." (phone only, 16 px under the identity). The hook explains itself in words before the visitor sees it.
- "Store listing, iPhone; the same screen is on Google Play" in 13 px mono. Source note, not content.
- "Moderated live chat. 34 routes, 270+ components." (Bayyinah TV): two unrelated fragments.
- "Live, with links to both app stores." (bayyinah.org): filler result, same as projector.

### Claims a reader could doubt

- "Two platform rewrites" (headline). CONTENT.md §0 says "**Part of** two platform rewrites". The headline drops "Part of" and claims ownership. The other drafts keep "Part of". This is the one claim on the three pages that is stronger than the source.
- "three apps in both stores". Which three? The draft names Viva Fresh and Dukagjini in the content. Read to Feed's listings are removed: `projects.ts` links "App Store (archived)" and "Google Play (archived)" (Wayback captures). A reader who checks finds two live apps, and the listings show the agency as publisher (`com.zs.*`), not his name. Present-tense "in both stores" for three apps is not supported.
- "Rework one billing report until it stops timing out." → "16 → 2 queries": supported (CONTENT.md: "no more timeouts").
- "Mobile · 2023" for Viva Fresh: supported (CONTENT.md table).

### Visually weak

- First screen (`thumbs7/sampled-ground.png`): the only work is a 604 × 370 crop of a store screenshot. Half of it is a product photo of a jar and a sketched-vegetable background texture. The ring sits on the image's bottom edge (ring y 612–697, image ends y 699), so it reads as a clipped border.
- Dead space in the panel text column: the meta block ends at y 530 and "Open the case" sits at y 677. About 145 px of maroon with nothing in it, beside the image.
- Phone 375 (`devil7/p/sg-m-top.png`): the identity block takes y 70–290; the screenshot is upscaled from 604 source px to about 340 css px at 3x density (about 1.8 device px per source px), so "Pastro Shporten" is soft.
- Palette harmony fails against its own rule "one accent": the six grounds are maroon (23), maroon again (34, shared), violet (282), brown (62), blue (253), teal (186). The bayyinah.org panel (oklch 0.42 0.13 62) is a muddy brown (`sg-grid` top-right). Half the hues land between 23° and 62°: the sampling rule mostly makes red-brown.

### The single change

Open on the strongest, newest work, not the oldest. Reverse the order (care platform or Bayyinah TV first) and remove every printed hue number from the first screen; keep the colour rule but let it be felt, not read. At the same time make the headline true: "Part of two platform rewrites. Apps live in both stores." (or name the two).

### Radical alternative

Drop the cards. One full-bleed ground per project, the real screen at its native size in the middle, and one plain line under it ("Rebuilt the video platform; live chat and subscriptions"). The page colour still comes from the screen, but there is no panel, no hue bar and no mono metadata. The colour change becomes the only motion, and it marks the start of a new project, which is its meaning.

---

## 3. Sampled-frame (new)

### First 10 seconds

- **Hiring manager.** Five lines of 40 px navy headline fill the left half. The right half is a navy wall with a component specimen: tokens, then an "Alert" card with "Build stopped at step 3 / One token points to a value that does not exist." Under it: "Sampled from the screen: 253°". Why they leave: the first screen is a design-tool panel plus an unexplained degree number. Nothing says "product a customer uses".
- **Founder.** Same opening as projector (the design system, not in production). Results down the page: "Moderated live chat, in 34 routes and 270+ components", "Live, with links to both app stores", "Progress is kept on every book". Three of seven results are features or links, not outcomes (builder admits two). Why they leave: "what changed for a business because he was there?"
- **Design-engineer peer.** Sees projector with a colour wall. Then sees the design-system showcase with six truncated token names. Why they leave: a design-system exhibit that clips its own labels reads as careless, and the layout is a known mash-up of the two round-6 leaders.

### Generic or already seen

- Split screen: light text column left, full-height dark colour panel right, sticky media in the panel. A common Webflow and Framer template layout.
- It is projector's frame plus sampled-ground's colour rule (the builder's `signature` says so). A reviewer who saw both will not find a new idea.
- Vertical tray of 44 px numbered slots on the right edge, plus 96 px log numerals, plus "01 / 07" on phone: three indexes of the same seven items.

### Unclear, too technical, or filler (exact lines)

- "Sampled from the screen: 253°" (on every frame; phone and desktop). The DOM text is "253 °" with a space split across spans, so a screen reader reads "253 degree" after a pause.
- "Generate every design token from one source, in three tiers." and "→ 805 tokens reach CSS, TypeScript and Figma". Jargon in the first result.
- "Moderated live chat, in 34 routes and 270+ components". Chat is not "in 34 routes". The sentence joins two facts with a wrong preposition.
- "Progress is kept on every book". A feature, said in passive voice, as the result of four years of releases. The real fact ("about 14 releases, React Native 0.63 → 0.81") is absent.
- Alert copy inside the specimen ("Two tokens have no owner. Assign an owner before the next release.") is invented process text that competes with the real claim beside it.

### Claims a reader could doubt

- "805 tokens reach CSS, TypeScript and Figma": supported by CONTENT.md §6; team work not stated (see top).
- "Build the sign-in of a smart-wallet dashboard. Teammates built the wallet layer." supported (CONTENT.md §5).
- "Checkout in Albanian, live in both stores" (Viva Fresh): supported by `caseNarratives.ts`.
- "Frontend, core team · 2023–26" (Bayyinah TV): supported (CONTENT.md §3).

### Visually weak

- **Truncated labels in the first exhibit.** Measured at 1440 × 900: six token names are cut with an ellipsis (`action.primary`, `button.solid.bg`, `surface.raised`, `status.success`, `alert.success.icon`, `field.focus.ring`). On screen: "action.prima…", "button.so…", "status.succe…", "alert.succe…", "field.focus…". A design-system showcase must not clip its own token names.
- **Clipped plate on phone.** At 540 × 960 and 375 × 812 (`devil7/p/sf-p-top.png`, `sf-m-top.png`, reel `sampled-frame-1.png`) the plate starts in the middle of the Tokens card: the "Tokens" title, the Light/Dark switch and the `cobalt.600` row are cut off above the plate's top edge ("Tokens" measured at y 69, above the visible plate). The card's top border shows as a stub. It looks like a broken crop.
- Phone highlight at 375 orphans "Figma" on its own band.
- The colour rule makes brown. Measured hues: 253, 185, 34, 61, 282, 78, 24. Four of seven walls (34, 61, 78, 24) are red-brown to mustard-brown at oklch 0.42 0.13; rows 04 and 06 (`sf-grid`, bottom-middle and top-right) are two near-identical brown walls. The "catchy colour" is mostly mud.
- The wall is 800 px wide and holds a 576 px frame: about 92 px of solid navy at the left of the frame and 64 px between frame and tray. The colour mass is larger than the work it frames (chroma 28% overall, but the wall is the largest single area on the first screen).
- The builder admits the reveal circle cuts plate glyphs for about 40 ms, and the paused live room shows about 60 px of empty chat.

### The single change

Make the first plate whole and legible at every width: show three token rows at full label width (no ellipsis) with the Tokens header kept on phone, or open on a different screen. Delete the "Sampled from the screen: N°" line. Without these two fixes the draft fails the first-screen test for a peer and a manager at the same time.

### Radical alternative

Stop the merge. Either give the wall to projector with one fixed colour (no sampling, so no brown runs), or keep the sampling and drop the log: a single large frame, one project per screen height, the wall colour from the screen, and the text set over the wall under the frame. Then the draft has one idea, not two ideas from two other drafts.

---

## Summary table

| Draft | Strongest objection | Proof | One change |
| --- | --- | --- | --- |
| projector | Opens on a token table for a system "not in production yet"; first shipped product with a result appears at row 04, and that result is "links to both app stores" | `thumbs7/projector.png`; CONTENT.md §6; `pj-grid` rows 03, 04, 09 | Open on a shipped product and a plain problem → result; cut rows 04 and 09; say team or solo on the design system |
| sampled-ground | Headline overclaims ("Two platform rewrites", source says "Part of"; "three apps in both stores" while Read to Feed is archived), then the first work is a grocery cart and four hue readouts | `Draft.tsx:700`; CONTENT.md §0; `projects.ts` readToFeedLinks | Lead with the newest, strongest card; delete printed hue numbers; make the headline true |
| sampled-frame | First exhibit is visibly broken: six ellipsized token names at 1440, the plate head clipped at 375 and 540; plus 4 of 7 walls are brown | DOM measurement; `devil7/p/sf-p-top.png`; meta `hues` | Make the opening plate whole at every width and delete "Sampled from the screen: N°" |
