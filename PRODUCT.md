# PRODUCT.md — Gentrit Rashiti portfolio

## What this is

A routed personal portfolio for Gentrit Rashiti, Frontend & Mobile Developer who moved to full stack. Local only for now (no hosting). Built with Vite + React 19 + TypeScript + Tailwind 4 + react-router 7 + `motion` (Framer Motion successor) + Phosphor icons.

## Audience

Hiring managers and senior engineers who scan a portfolio for 60 seconds, then dig into one case study. They want to see range (web, mobile, backend), taste, and proof of craft. Many of them will open it on a phone first.

## The one idea

Gentrit has shipped products across **healthcare**, **video streaming**, **e-reading / mobile**, and **Web3**. The work leads through a readable project index and large product imagery. A visitor can scan selected work, reveal the full index, or switch to a visual wall, then open a factual case study. An optional canvas supports playful exploration without becoming a required step.

The owner-approved visual direction is the hybrid recommended in `design/art-directions/ASTRA-ART-DIRECTIONS.md`: Index × Preview for home, a colour-sorted wall for all work, studio product shots and exploded technical diagrams for case pages, and a pan/zoom canvas with a desktop easter egg. One local sans family, one mono family, a dark/light neutral shell and restrained cobalt controls unify these surfaces. Product imagery supplies the stronger colour. DESIGN.md records the implemented visual system; `.impeccable/surfaces/src-app-tsx.md` records the page sequence.

## Hard constraint: public products, public pages only

Owner rule (2026-10-02):

- Public products may be named and linked, for example to their website, their store listings, or an archived store listing.
- Screenshots come only from public pages and public store listings. Never capture a running app, a build, or any screen behind a login.
- Do not state a relation between the employer and a client. Do not say that a product was a client of the employer. The employer Vianova is named only on its own platform rows.
- Employer names (Vianova, Incentiv, AvahiTech) belong only to their own work records. Agency work for clients keeps separate attribution, with no employer name. The index and wall may order projects by the approved visual structure without implying a relationship between an employer and a public product.
- Products that are not public keep generic names ("chatbot runtime library", "member portal").
- No client, tenant, patient or colleague names; no internal URLs, ticket IDs or API hosts.
- Internal screens of the care-management platform remain live recreations: small interactive React components with invented data and no brand, built from scratch for this site. They evoke the feature; they do not copy the product.

Personal projects (Snaxx Tech studio site, Offday, open-source forks) are Gentrit's own and may use real assets (see `public/personal/`).

## Mode

Experience (portfolio): the artifact leads from the first viewport; the interface recedes. Secondary mode: Read, for the case-study text.

## Success

A visitor understands in 10 seconds that Gentrit builds polished products across web, mobile and backend, and in 60 seconds can point at one concrete thing he built in each world. The page feels expensive, fast, calm and alive. It works at 375px and at 1440px, in light and dark mode, and with reduced motion.
