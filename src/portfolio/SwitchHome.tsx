import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { AllWork } from "./AllWork"
import { ARROW, links, plain } from "./data"
import { cropVars, shots, type Crop, type Shot } from "./screens"
import { useNearViewport } from "./useNearViewport"
import "./refractive-engine.css"
import "./home.css"
import "./switch.css"

/**
 * PROTOTYPE (branch proto/switch-home, never merged): the home built around Offday's Interface / Server rules / Data
 * switch, at /switch. Owner's conditions (2026-11-02): a project shows a layer only if its case page's role line says the
 * owner built it; every line of evidence is readable without a tap (the switch only changes the plate); no dot field, one
 * lit table under each stack. Layers per project and the quote behind each: design/reviews/switch-prototype/layers.md.
 */

const NAMES = ['Interface', 'Server rules', 'Data'] as const

type Img = Shot & { crop?: Crop; phoneCrop?: Crop; className?: string; style?: CSSProperties }
type Built = { line: string; plate: Img | ReactNode }
type Absent = { absent: string }
type Layer = Built | Absent
const isImg = (p: Built['plate']): p is Img => !!p && typeof p === 'object' && 'src' in p

/** A plate of text on the page's own ground: a title, ruled rows, a source line. */
function TextPlate({ title, rows, foot }: { title: string; rows: [string, ReactNode][]; foot?: string }) {
  return (
    <div className="re-intro-tables sh-text">
      <p>{title}</p>
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {foot && <p>{foot}</p>}
    </div>
  )
}

/**
 * One project's layers: the ledger (all three names, each built layer's line, the others named as not the owner's) and
 * the stack of plates for the built ones. With two or more built layers the ledger rows are the switch. A plate whose
 * screen is not yet decoded waits behind the current one, as on the current home's Offday stack: "Loading…" after a
 * second, an error with a retry if the request fails, and another pick cancels the wait.
 */
function Layered({ name, layers, hero, caption, ar, nar, width }: {
  name: string; layers: [Layer, Layer, Layer]; hero?: boolean; caption?: string; ar: number; nar: number; width?: number
}) {
  const built = layers.flatMap((l, i) => ('absent' in l ? [] : [i]))
  const first = built[0]
  const plate = (i: number) => (layers[i] as Built).plate
  const waits = (i: number) => i !== first && isImg(plate(i))
  const [layer, setLayer] = useState(first)
  const [shown, setShown] = useState(first)
  const [instant, setInstant] = useState(false)
  const [broken, setBroken] = useState(-1)
  const [failed, setFailed] = useState(false)
  const [slow, setSlow] = useState(false)
  const art = useRef<HTMLElement>(null)
  const control = useRef<HTMLUListElement>(null)
  const imgs = useRef<Record<number, HTMLImageElement | null>>({})
  const near = useNearViewport(art, '100%')
  const choose = (i: number, keyboard: boolean) => {
    setInstant(keyboard)
    setFailed(false)
    setSlow(false)
    setLayer(i)
    if (!waits(i)) setShown(i)
    else if (broken === i) setBroken(-1)
  }
  const waiting = waits(layer)
  useEffect(() => {
    const img = imgs.current[layer]
    if (layer === shown || !waiting || broken === layer || !img) return
    let live = true
    const late = setTimeout(() => { if (live) setSlow(true) }, 1000)
    img.decode().then(() => { if (live) setShown(layer) }, () => { if (live) { setLayer(shown); setFailed(true) } })
    return () => { live = false; clearTimeout(late) }
  }, [layer, broken, shown, waiting])
  const loading = slow && layer !== shown
  const many = built.length > 1
  const depth = (i: number) => built.indexOf(i) - built.indexOf(shown)

  const ledger = (
    <ul ref={control} className={`sh-ledger${many ? ' re-stk-control' : ''}`} aria-label={`${name}: what I built, layer by layer`}>
      {layers.map((l, i) => {
        const head = <span className="sh-lname">{NAMES[i]}</span>
        if ('absent' in l) return <li key={i} data-absent>{head}<span className="sh-lline">{l.absent}</span></li>
        return (
          <li key={i}>
            {many
              ? <button type="button" data-l={i} aria-pressed={layer === i} onClick={(e) => choose(i, e.detail === 0)}>{head}<span className="sh-lline">{l.line}</span></button>
              : <div className="sh-lrow">{head}<span className="sh-lline">{l.line}</span></div>}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="sh-layered" data-instant={instant || undefined} style={{ '--ar': ar, '--nar': nar, ...(width ? { '--stack-w': `${width}px` } : {}) } as CSSProperties}>
      {ledger}
      <figure ref={art} className={hero ? 're-intro-art sh-art' : 'sh-art'} data-work={hero ? 'offday' : undefined}>
        <div className="re-stk">
          {built.map((i) => {
            const p = plate(i), d = depth(i)
            return (
              <div key={i} className="re-stk-plate" data-l={i} data-d={d} aria-hidden={i !== shown || undefined} onClick={d > 0 ? () => choose(i, false) : undefined}>
                {isImg(p) ? (
                  (i === first || near || layer === i) && broken !== i && (
                    <div className="re-stk-visual">
                      <img ref={(el) => { imgs.current[i] = el }} className={p.className ?? 'sh-shot'} src={p.src} width={p.w} height={p.h} alt={p.alt}
                        style={(p.className ? p.style : { ...cropVars(p, p.crop), ...cropVars(p, p.phoneCrop ?? p.crop, 'n') }) as CSSProperties}
                        loading={i === first && hero ? 'eager' : 'lazy'} fetchPriority={i === first && hero ? 'high' : 'low'} decoding="async"
                        onError={() => { setBroken(i); if (layer === i) { setLayer(shown); setFailed(true) } }} />
                    </div>
                  )
                ) : p}
                {many && <span className="re-stk-name">{NAMES[i]}</span>}
              </div>
            )
          })}
        </div>
        <figcaption>{failed
          ? <span role="alert">Couldn't load the {NAMES[built.find(waits)!].toLowerCase()} screen. <button type="button" className="re-stk-retry" onClick={(e) => {
              const i = built.find(waits)!
              control.current?.querySelector<HTMLButtonElement>(`[data-l="${i}"]`)?.focus()
              choose(i, e.detail === 0)
            }}>Try again</button></span>
          : loading ? <span role="status">Loading the {NAMES[layer].toLowerCase()} screen…</span>
          : isImg(plate(shown)) ? caption : null}</figcaption>
      </figure>
    </div>
  )
}

/** Offday's plates, as on the current home (HomeIntro.tsx): the calendar, the privacy section's crop, the tables. */
const OFFDAY_RULES: Img = {
  src: '/showcase/offday/offday-landing-security.webp', w: 2880, h: 1800, className: 're-intro-rules',
  alt: "Offday's privacy section: Sofia's vacation request as a teammate sees it, with the dates and her private note locked. Invented data.",
  style: { ...cropVars({ w: 2880, h: 1800 } as Shot, [1280, 226, 1558, 760]), ...cropVars({ w: 2880, h: 1800 } as Shot, [1451, 239, 1130, 729], 'n') } as CSSProperties,
}
const OFFDAY_TABLES: [string, boolean, string][] = [
  ['organizations', false, 'id · name · allowance'],
  ['employees', true, 'department · allowance'],
  ['users', true, 'role: manager or employee'],
  ['requests', true, 'start · end · status · note'],
  ['shifts', true, 'employee_id · date'],
]
const OFFDAY: [Layer, Layer, Layer] = [
  { line: 'Team requests, approvals and a shared calendar.', plate: { src: '/showcase/offday/offday-desktop-calendar.webp', w: 2880, h: 1800, className: 're-intro-ui', alt: "Offday's October team calendar, leave bars and manager approval queue. Invented data." } },
  { line: 'Roles and organization membership are checked on the server.', plate: OFFDAY_RULES },
  {
    line: 'SQLite stores workspaces, requests and balances.',
    plate: <TextPlate title="Offday's tables · SQLite" rows={OFFDAY_TABLES.map(([t, tenant, c]) => [t, <>{tenant && <><b>org_id</b> · </>}{c}</>])} foot="From lib/store.ts. Company records carry an org_id." />,
  },
]

const NOT_MINE = { absent: 'Not in this role' }

type Project = {
  id: string; name: string; headline: string; meta: string; role: string; proof: ReactNode; extra?: ReactNode
  layers: [Layer, Layer, Layer]; ar: number; nar: number; width?: number; caption?: string
  link: { slug: string; label: string } | { href: string; label: string }
}

const reach = (href: string) => (
  <a className="sh-proof sh-proof-link" href={href} target="_blank" rel="noreferrer">
    100K+ Google Play downloads<small>Product reach · October 2026<span className="re-sr"> (opens in a new tab)</span></small>
  </a>
)

/** Sources: caseDetails.ts (role lines), projects.ts and CONTENT.md §2, §4, §6b, §7, §11; Tondo dcaff64 server/migrations/001_crews.sql. */
const PROJECTS: Project[] = [
  {
    id: 'care', name: 'Care-management platform', headline: 'Rebuilding a care platform, one tested screen at a time.',
    meta: 'A team effort · 2023–26',
    role: 'Web and mobile; since 2026 also the server',
    proof: <p className="sh-proof">One billing report: 16 queries → 2<small>It no longer times out. One report, not the whole API.</small></p>,
    extra: <ol className="sh-process" aria-label="How each screen moves over"><li>Test the existing screen</li><li>AI agents build</li><li>Run the checks</li><li>A person approves</li></ol>,
    layers: [
      { line: 'The Vue app since 2023; the team now moves it to React one route at a time, with parity tests.', plate: { ...shots.calendar, phoneCrop: [440, 380, 1100, 960] } },
      {
        line: 'The Laravel API since 2026: tenant boundaries, enrollment drafts, a lab catalog.',
        plate: <TextPlate title="The Laravel API · since 2026" rows={[
          ['Tenants', "Each organization's records stay out of every other organization's responses."],
          ['Enrollment', "A care team saves a patient's enrollment and finishes it later."],
          ['Labs', 'A lab catalog for the lab screens.'],
          ['Report', '16 queries → 2; it no longer times out.'],
        ]} foot="Tests on Pest, against MySQL and Redis." />,
      },
      { absent: 'Not in this role; the report fix was in the API' },
    ],
    ar: 1.6, nar: 1.146, caption: 'React rewrite in progress. Real product screens, invented data.',
    link: { slug: 'care-platform', label: 'Read the care-management platform case' },
  },
  {
    id: 'bayyinah', name: 'Bayyinah TV', headline: 'Rebuilt a live learning platform.', meta: 'Frontend · 2023–2026',
    role: 'Frontend, on the core team of the rebuild.',
    proof: reach('https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah'),
    layers: [{ line: 'Live and on-demand video, subscriptions and English/Arabic support across web and mobile, for an existing audience.', plate: { ...shots.landing, crop: [0, 0, 2880, 1420], phoneCrop: [40, 400, 1400, 1000] } }, NOT_MINE, NOT_MINE],
    ar: 2880 / 1420, nar: 1.4, link: { slug: 'bayyinah-tv', label: 'Read the Bayyinah TV case' },
  },
  {
    id: 'reading', name: 'Read to Feed', headline: "Kept a children's reading app shipping for four years.", meta: 'Mobile, iOS and Android · 2022–25',
    role: 'Mobile developer, iOS and Android.',
    proof: <p className="sh-proof">About 14 store releases<small>React Native 0.63 → 0.81</small></p>,
    layers: [{ line: 'EPUB and PDF reader, barcode scanning, quizzes, badges and streaks, in three languages.', plate: { ...shots.reader, crop: [82, 462, 616, 900] } }, NOT_MINE, NOT_MINE],
    ar: 616 / 900, nar: 616 / 900, width: 300, caption: 'Store listing image.', link: { slug: 'read-to-feed', label: 'Read the Read to Feed case' },
  },
  {
    id: 'system', name: 'Design System v2', headline: 'One shared library, checked before release.', meta: 'A team effort · 2026',
    role: 'Frontend developer on the team that builds it.',
    proof: <p className="sh-proof">41 components, 22 releases in 60 days.<small>An app that imports only Button: 186,949 → 6,386 bytes of JavaScript.</small></p>,
    layers: [{ line: "The team's shared library: 868 design values generate CSS, TypeScript and Figma.", plate: { ...shots.matrix, crop: [1280, 145, 1780, 1430] } }, { absent: 'None: a component library' }, { absent: 'None: a component library' }],
    ar: 1780 / 1430, nar: 1780 / 1430, width: 560, link: { slug: 'design-system-react', label: 'Read the Design System v2 case' },
  },
  {
    id: 'viva', name: 'Viva Fresh', headline: 'Shipped grocery shopping on iOS and Android.', meta: 'Mobile · 2023',
    role: 'Mobile developer.',
    proof: reach('https://play.google.com/store/apps/details?id=com.zs.vivafresh'),
    layers: [{ line: 'Categories, cart, loyalty and a wishlist; delivery slots and address search on a map.', plate: { ...shots.catalog, crop: [88, 298, 604, 880] } }, NOT_MINE, NOT_MINE],
    ar: 604 / 880, nar: 604 / 880, width: 300, link: { slug: 'viva-fresh', label: 'Read the Viva Fresh case' },
  },
  {
    id: 'tondo', name: 'Tondo', headline: 'The server checks every move.', meta: "Own product · 2026 · Reuses Za!'s multiplayer server",
    role: 'Owner.',
    proof: <p className="sh-proof">Live, server-authoritative<small>Bots fill empty seats; saved crews outlive a room.</small></p>,
    layers: [
      { line: 'A round card table for 2–4 players, with bots and a one-tap game against three of them.', plate: { src: '/personal/shots/tondo-desktop.webp', w: 2880, h: 1800, alt: "Tondo's round card table with bot players.", phoneCrop: [820, 100, 1240, 1080] } },
      {
        line: 'A Node server checks each move against the game rules and sends every player the new state over WebSockets.',
        plate: <TextPlate title="The game server · Node, ws" rows={[
          ['Move', 'A player sends the move they intend.'],
          ['Check', 'The server checks it against the game rules.'],
          ['State', 'Every player gets a full snapshot.'],
          ['Limits', 'Requests limited per real client address.'],
        ]} />,
      },
      {
        line: 'Saved crews in PostgreSQL, with SQL migrations and database tests.',
        plate: <TextPlate title="Tondo's tables · PostgreSQL" rows={[
          ['crews', 'name · last_pie_at'],
          ['members', 'crew_id · name · left_at'],
          ['pies', 'crew_id · rounds · bots'],
          ['pie_players', 'pie_id · member_id · points · won'],
        ]} foot="From server/migrations/001_crews.sql. Leaving a crew clears the name, its only copy." />,
      },
    ],
    ar: 1.6, nar: 1240 / 1080,
    link: { href: 'https://github.com/gentritr1/tondo', label: 'Explore the code' },
  },
  {
    id: 'leakscan', name: 'LeakScan', headline: 'Check ownership before scanning an app.', meta: 'Built alone · Pre-launch · 2026',
    role: 'Owner, built alone.',
    proof: <p className="sh-proof">7 checks, one plain-English report<small>4 free checks show what a stranger can see.</small></p>,
    layers: [
      { line: 'A plain-English report with a fix prompt for each finding.', plate: { src: '/showcase/leakscan/leakscan-desktop-report.webp', w: 2880, h: 1800, crop: [0, 0, 2880, 1520], phoneCrop: [640, 340, 1420, 1180], alt: 'LeakScan Full Scan report for an invented app: health score 48 and the three critical fixes to start with. Invented data.' } },
      {
        line: 'Domain proof comes before any scan; repository and database access is read-only.',
        plate: <TextPlate title="Before a scan" rows={[
          ['1 Prove it', 'DNS or a verification file shows the app is yours.'],
          ['2 Connect', 'Optional repository and database access, read-only.'],
          ['3 Check', 'Seven code-based checks write the findings.'],
          ['4 Explain', 'An optional AI pass rewrites the explanations.'],
        ]} />,
      },
      {
        line: 'Stored credentials are encrypted, expire after 14 days and can be deleted in one click.',
        plate: <TextPlate title="What LeakScan keeps · Postgres" rows={[
          ['Credentials', 'Encrypted at rest'],
          ['Expiry', '14 days'],
          ['Delete', "One click, by the app's owner"],
          ['Rescan', 'One free, within 14 days'],
        ]} />,
      },
    ],
    ar: 2880 / 1520, nar: 1420 / 1180, caption: 'Real product screen, invented data.',
    link: { slug: 'leakscan', label: 'Read the LeakScan case' },
  },
]

// The page's scroll and trigger when a case opens, so Back lands where the reader left (module state outlives the route).
let back: { y: number; href: string } | null = null

export default function SwitchHome() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const open = (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!plain(e)) return
    e.preventDefault()
    back = { y: scrollY, href: `/${slug}` }
    navigate(`/${slug}`, { state: { from: pathname } })
  }
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('re-html')
    return () => html.classList.remove('re-html')
  }, [])
  useLayoutEffect(() => {
    if (!back) return
    const { y, href } = back
    back = null
    window.scrollTo({ top: y, behavior: 'instant' })
    document.querySelector<HTMLElement>(`main a[href="${href}"]`)?.focus({ preventScroll: true })
  }, [])

  const caseLink = (link: Project['link']) => 'slug' in link
    ? <a className="re-text-link" href={`/${link.slug}`} onClick={open(link.slug)}>{link.label} <ArrowRightIcon {...ARROW} /></a>
    : <a className="re-text-link" href={link.href} target="_blank" rel="noreferrer">{link.label} <ArrowUpRightIcon {...ARROW} /><span className="re-sr"> (opens in a new tab)</span></a>

  return (
    <div className="re-root sh" data-ready>
      <title>Gentrit Rashiti, software engineer (layer prototype)</title>
      <meta name="robots" content="noindex" />
      <header className="re-bar re-solid">
        <a className="re-mark" href="#re-top">Gentrit Rashiti</a>
        <nav className="re-nav" aria-label="Site">
          <a href="#re-work">Work</a>
          <a className="re-nav-about" href="#re-about">About</a>
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>

      <main>
        <section id="re-top" className="sh-hero" aria-labelledby="sh-h1">
          <div className="sh-hero-copy">
            <h1 id="sh-h1" tabIndex={-1}>I build web and mobile products, from interface to backend.</h1>
            <p className="sh-role">Software engineer: frontend, backend and mobile</p>
            <p className="sh-bio">5+ years shipping web and mobile products. Mostly for healthcare teams, learning platforms and consumer apps. Based in Kosovo, working remotely.</p>
          </div>
          <article id="sh-offday" className="sh-row sh-row-hero" aria-labelledby="sh-offday-h">
            <div className="sh-words">
              <h2 id="sh-offday-h" className="sh-hero-name">Offday</h2>
              <p className="sh-meta">Own product, a working MVP built with one other developer</p>
              <p className="sh-proof">About 200 Playwright tests<small>Including security and tenant isolation.</small></p>
            </div>
            <Layered name="Offday" layers={OFFDAY} hero ar={2.05} nar={1.55} caption="Real product screens, invented data." />
            <div className="sh-act">{caseLink({ slug: 'offday', label: 'Read the Offday case' })}</div>
          </article>
        </section>

        <section id="re-work" className="sh-work" aria-labelledby="sh-work-h">
          <div className="sh-work-head">
            <h2 id="sh-work-h" className="re-h2">Selected work, layer by layer</h2>
            <p className="re-lede">Each project shows only the layers its role covered. The others are named, not claimed.</p>
          </div>
          {PROJECTS.map((p) => (
            <article key={p.id} id={`work-${p.id}`} className="sh-row" aria-labelledby={`sh-${p.id}-h`}>
              <div className="sh-words">
                <p className="sh-name">{p.name}</p>
                <h3 id={`sh-${p.id}-h`}>{p.headline}</h3>
                <p className="sh-meta">{p.meta}</p>
                <p className="sh-meta">Role: “{p.role}”</p>
                {p.proof}
                {p.extra}
              </div>
              <Layered name={p.name} layers={p.layers} ar={p.ar} nar={p.nar} width={p.width} caption={p.caption} />
              <div className="sh-act">{caseLink(p.link)}</div>
            </article>
          ))}
        </section>

        <AllWork onOpen={(slug) => { back = { y: scrollY, href: `/${slug}` }; navigate(`/${slug}`, { state: { from: pathname } }) }} />

        {/* Copied from Evidence.tsx (the About section), unchanged. */}
        <section id="re-about" className="re-about re-solid" aria-labelledby="re-about-h">
          <h2 id="re-about-h" className="re-h2">From the interface to the whole product.</h2>
          <div>
            <p>I’m a software engineer with a background in frontend and mobile. I’ve stayed with products through store releases, framework upgrades and the fixes that come after launch.</p>
            <p>Since 2026, my work also includes Laravel APIs, database reports and permissions. My own projects extend that into realtime Node.js servers and AI features.</p>
            <p>I onboard developers to the care-platform rewrite. We discuss existing behavior, bugs and how to move one slice at a time. I also guide how we choose and coordinate AI agents within the team’s rules and checks.</p>
            <p>New tools keep me learning. The work still needs clear decisions, tests I can trust and a person accountable for the result.</p>
            <p className="re-engineering-meta">Based in Kosovo · Working remotely</p>
          </div>
        </section>

        {/* Copied from Draft.tsx (the contact footer), unchanged. */}
        <footer id="re-contact" className="re-contact">
          <div className="re-card re-solid">
            <h2 className="re-h2">Contact</h2>
            <p className="re-lede">Based in Kosovo, working remotely.</p>
            <div className="re-links">
              <a className="re-btn re-btn-solid" href={`mailto:${links.email}`}>{links.email}</a>
              <a className="re-btn" href={links.github} target="_blank" rel="noreferrer">GitHub<ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-btn" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-btn" href={links.cv}>CV (PDF)</a>
            </div>
            <p className="re-foot">Gentrit Rashiti</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
