# Layers shown on the /switch prototype, and the quote behind each

Rule (owner, 2026-11-02): a project shows a layer only if its case page's role line says the owner built it. Every
other layer is named in the ledger as not the owner's ("Not my layer"), or as absent from the product ("None: a
component library").

| Project | Interface | Server rules | Data | Role line (source) | Further source for the layers shown |
|---|---|---|---|---|---|
| Offday | shown | shown | shown | "Built with one other developer" (`src/portfolio/products.ts` own[0].role) | CONTENT.md §11: "Offday's layers are Interface, Server rules and Data … server role and organization checks; SQLite persistence of workspaces, requests and balances." Plates as on the current home. |
| Care-management platform | shown | shown | not mine | "Frontend on the Vue app since 2023, then the move to React and the rules and merge gates it runs inside; the Laravel API since 2026." (`caseDetails.ts`) | The role names an API, not a database. CONTENT.md §11: "The original Laravel repository was not available … no new query-mechanism claim is authorized." The 16 → 2 report and tenant boundaries sit under Server rules (projects.ts care-api summary). |
| Bayyinah TV | shown | not mine | not mine | "Frontend, on the core team of the rebuild." (`caseDetails.ts`) | 34 routes, 270+ components, RTL: caseDetails engineering and result. |
| Read to Feed | shown | not mine | not mine | "Mobile developer, iOS and Android." (`caseDetails.ts`) | Owner rule: Read to Feed's server side is not established as the owner's work. |
| Design System v2 | shown | none | none | "Frontend developer on the team that builds it." (`caseDetails.ts`) | 868 design values, 41 components, 22 releases in 60 days, 186,949 → 6,386 bytes: caseDetails diagram, CONTENT.md §6b, the home's Before and after ledger. |
| Viva Fresh | shown | not mine | not mine | "Mobile developer." (`caseDetails.ts`) | Features: caseDetails engineering. |
| Tondo & Za! | shown | shown | shown | "Owner" (`src/content/projects.ts`, both) | CONTENT.md §11 "authoritative Node/WebSocket servers … Tondo persists saved crews in PostgreSQL"; CONTENT.md: 77 commits, all the owner's. Data plate: Tondo `dcaff64` `server/migrations/001_crews.sql`, business columns only (no device_hash). |
| LeakScan | shown | shown | shown | "Owner, built alone" (`products.ts` own[1].role) | CONTENT.md §11 approved copy: domain proof before scanning, read-only access, encrypted credentials with a 14-day expiry; products.ts story. |

Not on the prototype: Incentiv ("Frontend developer, freelance: the portal UI. Teammates built the wallet and blockchain
layer.") would be Interface only; it is not on the current home's selected work either and stays in All projects.

## Found while building (outside this experiment)

The current home's Bayyinah chapter lists its layers from `caseDetails.ts` as "The live layer · AWS IVS · HLS · Pusher"
and "The membership · Stripe · Apple · Google". The role line is frontend only. If those rows mean the frontend's
integrations (player, chat, paywall), they are accurate but read like server and data layers; worth an owner check.
