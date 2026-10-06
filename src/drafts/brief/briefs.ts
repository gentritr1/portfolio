import { careShots, dsShots, REAL_SCREENS, type ScreenShot } from "../../content/careShots";
import { findProject, projects, type Project } from "../../content/projects";

export type Media =
  | { kind: "shot"; shot: ScreenShot; label: string }
  | { kind: "web"; src: string; alt: string; label: string }
  | { kind: "phones"; items: { src: string; alt: string }[]; label: string };

export interface Brief {
  project: Project;
  topic: string;
  domain: string;
  /** Problem text with proof edits: `[struck words|shipped words]`. An empty left side is an insertion. */
  proof: string;
  decision: string;
  media: Media;
}

const need = (slug: string) => {
  const project = findProject(slug);
  if (!project) throw new Error(`Unknown project ${slug}`);
  return project;
};

export const briefs: Brief[] = [
  {
    project: need("care-platform"),
    topic: "Rewrite",
    domain: "Healthcare",
    proof:
      "A care platform [runs on Nuxt 2|moves to React, route by route], and one billing report [times out on 16|needs 2] queries.",
    decision:
      "Rebuild one route at a time. A parity test runs each scenario against both apps, and a route moves over only when both behave the same. Decision records and automated quality gates keep every step reviewable.",
    media: { kind: "shot", shot: careShots.claims, label: REAL_SCREENS },
  },
  {
    project: need("bayyinah-tv"),
    topic: "Streaming",
    domain: "Streaming",
    proof:
      "Bayyinah TV's second version [starts from an empty template|ships 34 routes and 270+ components] and [has to stream|streams] live, in English and Arabic.",
    decision:
      "A full rebuild on Nuxt 3. Live streams run on AWS IVS with realtime chat and moderation, an HLS player puts premium video behind a paywall, and the same web app runs inside the iOS and Android apps.",
    media: {
      kind: "web",
      src: "/showcase/bayyinah/web-05.webp",
      alt: "Bayyinah TV series page: episode list in a side column, series summary and video cards",
      label: "bayyinahtv.com, public series page",
    },
  },
  {
    project: need("design-system-react"),
    topic: "System",
    domain: "Design system",
    proof:
      "A React dashboard [needs|gets 36] components and [|805] tokens from one source, [without loading the whole library|and a Button-only consumer loads 96.6% less JavaScript].",
    decision:
      "One token source in three tiers, core, semantic and component, generates CSS variables, TypeScript and a Figma bundle. Each component builds on its own and ships with axe tests and in-browser contrast checks. Twenty releases in about six weeks.",
    media: { kind: "shot", shot: dsShots.buttonAlert, label: REAL_SCREENS },
  },
  {
    project: need("read-to-feed"),
    topic: "Reading",
    domain: "Mobile",
    proof:
      "A children's reading app on React Native [0.63|0.81] [has to keep shipping|shipped about 14 releases] to both stores.",
    decision:
      "Upgrade React Native in three major steps, and keep the reader working with maintained forks of epubjs-react-native and react-native-pdf. The app reads PDF and EPUB, scans books by barcode and rewards reading with badges and streaks.",
    media: {
      kind: "phones",
      label: "archived App Store frames",
      items: [
        { src: "/mobile/reading-1.webp", alt: "Read to Feed store screenshot: My Books list with reading progress" },
        { src: "/mobile/reading-2.webp", alt: "Read to Feed store screenshot: achievements screen with eggs collected and quiz badges" },
        { src: "/mobile/reading-3.webp", alt: "Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot" },
      ],
    },
  },
  {
    project: need("incentiv"),
    topic: "Wallet",
    domain: "Web3",
    proof:
      "A smart-wallet portal [needs|is live with] one sign-in for passkeys and external wallets, in English and French.",
    decision:
      "Build the UI layer on Next.js 14 with the App Router and RTK Query: passkey and wallet sign-in, animated onboarding, dashboard cards, and middleware that keeps private routes behind sign-in. Teammates built the wallet and blockchain layer.",
    media: {
      kind: "web",
      src: "/showcase/incentiv/web-03.webp",
      alt: "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
      label: "portal.incentiv.io, public sign-in screen",
    },
  },
  {
    project: need("viva-fresh"),
    topic: "Grocery",
    domain: "Mobile",
    proof:
      "Viva Fresh [needs to take|takes] grocery orders, with delivery slots and a loyalty programme, on [two platforms|iPhone and Android from one codebase].",
    decision:
      "One React Native codebase with Redux Toolkit and Firebase. The cart keeps quantities, discounts and the running total in view, and a search on a map finds the delivery address.",
    media: {
      kind: "phones",
      label: "App Store frames",
      items: [
        { src: "/mobile/grocery-1.webp", alt: "Viva Fresh store screenshot: home with product categories and latest products, Albanian interface" },
        { src: "/mobile/grocery-2.webp", alt: "Viva Fresh store screenshot: Fresh category with a product grid and the cart total" },
        { src: "/mobile/grocery-3.webp", alt: "Viva Fresh store screenshot: cart with quantities, discount and checkout button" },
      ],
    },
  },
  {
    project: need("dukagjini-bookstore"),
    topic: "Bookstore",
    domain: "Mobile",
    proof:
      "A book publisher [needs|is live with] a shopping app, and a push notification [has to open|opens] the right book.",
    decision:
      "React Native with Redux and Firebase Messaging. A deep link routes each notification to its screen, the book-detail header animates as the page scrolls, and modals close with a swipe.",
    media: {
      kind: "phones",
      label: "App Store frames",
      items: [
        { src: "/mobile/bookstore-1.webp", alt: "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale" },
        { src: "/mobile/bookstore-2.webp", alt: "Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites" },
        { src: "/mobile/bookstore-3.webp", alt: "Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories" },
      ],
    },
  },
];

const featuredSlugs = new Set(briefs.map((brief) => brief.project.slug));

export const otherProjects = projects.filter((project) => !featuredSlugs.has(project.slug));

export type TokenKind = "keep" | "was" | "now";

export interface Token {
  id: number;
  text: string;
  kind: TokenKind;
  space: boolean;
  /** The next token is struck in the same edit, so the strike crosses the space. */
  joinsNext: boolean;
}

export function parseProof(source: string): Token[] {
  const tokens: Token[] = [];
  let pendingSpace = false;
  const add = (text: string, kind: TokenKind, leadingSpace: boolean) => {
    const words = /(\s*)(\S+)/g;
    let match: RegExpExecArray | null;
    let first = true;
    while ((match = words.exec(text))) {
      const space = tokens.length > 0 && !/^[,.;:]/.test(match[2]) && (match[1].length > 0 || (first && leadingSpace));
      tokens.push({ id: tokens.length, text: match[2], kind, space, joinsNext: false });
      first = false;
    }
    return /\s$/.test(text);
  };
  const edits = /\[([^|\]]*)\|([^\]]*)\]/g;
  let position = 0;
  let match: RegExpExecArray | null;
  while ((match = edits.exec(source))) {
    pendingSpace = add(source.slice(position, match.index), "keep", pendingSpace);
    const start = tokens.length;
    add(match[1], "was", pendingSpace);
    for (let i = start; i < tokens.length - 1; i += 1) tokens[i].joinsNext = true;
    add(match[2], "now", match[1].trim().length > 0 || pendingSpace);
    pendingSpace = false;
    position = match.index + match[0].length;
  }
  add(source.slice(position), "keep", pendingSpace);
  return tokens;
}

export const readAs = (tokens: Token[], state: "problem" | "result") =>
  tokens
    .filter((token) => token.kind === "keep" || token.kind === (state === "problem" ? "was" : "now"))
    .map((token, index) => (index > 0 && token.space ? " " : "") + token.text)
    .join("");
