# Layers shown on the /switch prototype, and the quote behind each

Rule (owner, 2026-11-02): a project shows a layer only if its case page's role line says the owner built it. Every
other layer is named in the ledger as "Not in this role", or as absent from the product ("None: a component library").
Project copy is in neutral or team voice (CONTENT.md voice rules 2026-10-02 and 2026-10-07).

**Round 2 (after the fresh review):** Design System v2's row now reads as the team's library (CONTENT.md: "the team's work,
with no individual credit"); the care row quotes projects.ts's role ("Web and mobile; since 2026 also the server")
instead of the case page's line, whose "rules and merge gates" credits one person with team work; care's Data row says
the report fix was in the API; Bayyinah leads with live and on-demand video for an existing audience (owner emphasis
2026-10-27) instead of the rebuild's counts; the Tondo row is Tondo only, naming Za! as sharing its server.

| Project | Interface | Server rules | Data | Role line (source) | Further source for the layers shown |
|---|---|---|---|---|---|
| Offday | shown | shown | shown | "Built with one other developer" (`src/portfolio/products.ts` own[0].role) | CONTENT.md §11: "Offday's layers are Interface, Server rules and Data … server role and organization checks; SQLite persistence of workspaces, requests and balances." Plates as on the current home. |
| Care-management platform | shown | shown | not in this role | "Web and mobile; since 2026 also the server" (`projects.ts`; the case page's line adds "the Laravel API since 2026") | The role names an API, not a database. CONTENT.md §11: "The original Laravel repository was not available … no new query-mechanism claim is authorized." The 16 → 2 report and tenant boundaries sit under Server rules (projects.ts care-api summary). |
| Bayyinah TV | shown | not in this role | not in this role | "Frontend, on the core team of the rebuild." (`caseDetails.ts`) | The line is the current home's chapter line (Production.tsx) plus "for an existing audience" (CONTENT.md, Bayyinah showcase emphasis, owner 2026-10-27). |
| Read to Feed | shown | not in this role | not in this role | "Mobile developer, iOS and Android." (`caseDetails.ts`) | Owner rule: Read to Feed's server side is not established as the owner's work. |
| Design System v2 | shown, as the team's | none | none | "Frontend developer on the team that builds it." (`caseDetails.ts`) | 868 design values, 41 components, 22 releases in 60 days, 186,949 → 6,386 bytes: caseDetails diagram, CONTENT.md §6b, the home's Before and after ledger. |
| Viva Fresh | shown | not in this role | not in this role | "Mobile developer." (`caseDetails.ts`) | Features: caseDetails engineering. |
| Tondo | shown | shown | shown | "Owner" (`src/content/projects.ts`) | CONTENT.md §11 "authoritative Node/WebSocket servers … Tondo persists saved crews in PostgreSQL"; CONTENT.md: 77 commits, all the owner's. Data plate: Tondo `dcaff64` `server/migrations/001_crews.sql`, business columns only (no device_hash). |
| LeakScan | shown | shown | shown | "Owner, built alone" (`products.ts` own[1].role) | CONTENT.md §11 approved copy: domain proof before scanning, read-only access, encrypted credentials with a 14-day expiry; products.ts story. |

Not on the prototype: Incentiv ("Frontend developer, freelance: the portal UI. Teammates built the wallet and blockchain
layer.") would be Interface only; it is not on the current home's selected work either and stays in All projects.

## Found while building (outside this experiment)

The current home's Bayyinah chapter lists its layers from `caseDetails.ts` as "The live layer · AWS IVS · HLS · Pusher"
and "The membership · Stripe · Apple · Google". The role line is frontend only. If those rows mean the frontend's
integrations (player, chat, paywall), they are accurate but read like server and data layers; worth an owner check.

The care case page's own role line ("…then the move to React and the rules and merge gates it runs inside…") credits one
person with team work against the 2026-10-07 voice rule. It is live on /care-platform; owner check.

Open owner question: Offday was "built with one other developer"; neither page says which layers each built.
