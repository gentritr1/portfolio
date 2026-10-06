export type Lang = "en" | "sq" | "ar";

export const langs: readonly Lang[] = ["en", "sq", "ar"];

/** Each language name is written in its own script. */
export const names: Record<Lang, string> = {
  en: "English",
  sq: "Shqip",
  ar: "العربية",
};

export const dirOf = (lang: string) => (lang === "ar" ? "rtl" : "ltr");

type Text = Record<Lang, string>;

interface Page {
  title: string;
  navLabel: string;
  cv: string;
  email: string;
  line: string;
  readIn: string;
  sub: string;
  flips: string;
  heroCaption: string;
  altWeb: string;
  altPhone: string;
  rowsTitle: string;
  langsLabel: string;
  albTitle: string;
  albLine: string;
  fjaleCaption: string;
  fjaleAlt: string;
  vivaCaption: string;
  vivaAlt: string;
  contact: string;
  footLine: string;
  archived: string;
  noLink: string;
  top: string;
  ownTitle: string;
  ownLine: string;
  offdayKind: string;
  offdayResult: string;
  offdayNote: string;
  offdayAlt: string;
  concept: string;
  offbeatKind: string;
  offbeatAlt: string;
  formKind: string;
  formAlt: string;
}

export const page: Record<Lang, Page> = {
  en: {
    title: "Gentrit Rashiti, web and mobile apps",
    navLabel: "Language",
    cv: "CV (PDF)",
    email: "Email",
    line: "Gentrit Rashiti builds web and mobile apps.",
    readIn: "This page also reads in",
    sub: "Part of two platform rewrites. 5+ years, based in Kosovo, working remotely.",
    flips: "right to left",
    heroCaption: "Bayyinah TV library, Arabic courses tab. Public pages.",
    altWeb: "Bayyinah TV library, Arabic tab: beginner courses and the flagship Arabic program",
    altPhone: "Bayyinah TV library at phone width: the Arabic tab, New to Arabic, and two beginner courses",
    rowsTitle: "Apps, and the languages they ship in",
    langsLabel: "Languages",
    albTitle: "In Albanian",
    albLine: "Two apps with an Albanian interface: his own word game and a grocery app.",
    fjaleCaption: "FJALË, his own daily word game, with an Albanian keyboard.",
    fjaleAlt: "FJALË word game board: a five-letter grid, an Albanian keyboard and a hint panel",
    vivaCaption: "Viva Fresh home screen, Albanian interface.",
    vivaAlt: "Viva Fresh home screen: product categories and the latest products, Albanian interface",
    contact: "Contact",
    footLine: "Each client screen on this page is a public page or a store screenshot.",
    archived: "archived",
    noLink: "No public pages",
    top: "Gentrit Rashiti, back to the top",
    ownTitle: "His own products",
    ownLine: "Three products made on his own time. Two of them are concepts.",
    offdayKind: "Time off for teams: requests, approvals and a shared calendar.",
    offdayResult: "About 200 automatic tests, including tests that keep each team’s data private.",
    offdayNote: "Own product, 2026. The code is private.",
    offdayAlt: "Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue",
    concept: "Concept",
    offbeatKind: "A made-up speaker brand, with a working eight-step drum machine.",
    offbeatAlt: "OFFBEAT sound studio: an eight-step drum machine with kick, snare, hi-hat and bass rows, tempo, volume and a swing dial",
    formKind: "A made-up sculpture show. Three shapes from mathematics, drawn live in the browser.",
    formAlt: "FORM home: a copper trefoil knot sculpture, the title Objects of imagination, and the material swatches",
  },
  sq: {
    title: "Gentrit Rashiti, aplikacione web dhe mobile",
    navLabel: "Gjuha",
    cv: "CV (PDF)",
    email: "Email",
    line: "Gentrit Rashiti ndërton aplikacione web dhe mobile.",
    readIn: "Kjo faqe lexohet edhe në",
    sub: "Pjesë e dy rishkrimeve të platformave. Mbi 5 vjet përvojë, në Kosovë, punon në distancë.",
    flips: "nga e djathta në të majtë",
    heroCaption: "Biblioteka e Bayyinah TV, skeda e kurseve të arabishtes. Faqe publike.",
    altWeb: "Biblioteka e Bayyinah TV, skeda Arabisht: kurse për fillestarë dhe programi kryesor i arabishtes",
    altPhone: "Biblioteka e Bayyinah TV në gjerësinë e telefonit: skeda Arabisht, New to Arabic dhe dy kurse për fillestarë",
    rowsTitle: "Aplikacionet, dhe gjuhët në të cilat dalin",
    langsLabel: "Gjuhët",
    albTitle: "Në shqip",
    albLine: "Dy aplikacione me ndërfaqe në shqip: loja e tij me fjalë dhe një aplikacion ushqimor.",
    fjaleCaption: "FJALË, loja e tij ditore me fjalë, me tastierë shqipe.",
    fjaleAlt: "Tabela e lojës FJALË: rrjetë me pesë shkronja, tastierë shqipe dhe paneli i ndihmës",
    vivaCaption: "Viva Fresh, ekrani kryesor, ndërfaqe në shqip.",
    vivaAlt: "Ekrani kryesor i Viva Fresh: kategoritë e produkteve dhe produktet e fundit, ndërfaqe në shqip",
    contact: "Kontakt",
    footLine: "Çdo ekran klienti në këtë faqe është faqe publike ose pamje nga dyqani i aplikacioneve.",
    archived: "arkivuar",
    noLink: "Pa faqe publike",
    top: "Gentrit Rashiti, kthehu në fillim",
    ownTitle: "Produktet e tij",
    ownLine: "Tre produkte të bëra në kohën e tij të lirë. Dy prej tyre janë koncepte.",
    offdayKind: "Pushime për ekipet: kërkesa, miratime dhe një kalendar i përbashkët.",
    offdayResult: "Rreth 200 teste automatike, edhe teste që i mbajnë private të dhënat e çdo ekipi.",
    offdayNote: "Produkt personal, 2026. Kodi është privat.",
    offdayAlt: "Kalendari i ekipit në Offday për tetor 2026, me pushimet, një festë zyrtare dhe radhën e miratimeve",
    concept: "Koncept",
    offbeatKind: "Një markë altoparlantësh e shpikur, me një makinë ritmi me tetë hapa që punon.",
    offbeatAlt: "Studioja e zërit në OFFBEAT: makinë ritmi me tetë hapa, me rreshtat kick, snare, hi-hat dhe bas, tempo, volum dhe një çelës swing",
    formKind: "Një ekspozitë skulpturash e shpikur. Tri forma nga matematika, të vizatuara drejtpërdrejt në shfletues.",
    formAlt: "Faqja kryesore e FORM: skulptura e nyjës trefoil prej bakri, titulli Objects of imagination dhe ngjyrat e materialeve",
  },
  ar: {
    title: "جنتريت راشيتي، تطبيقات الويب والجوّال",
    navLabel: "اللغة",
    cv: "السيرة الذاتية (PDF)",
    email: "البريد الإلكتروني",
    line: "جنتريت راشيتي يبني تطبيقات الويب والجوّال.",
    readIn: "تُقرأ هذه الصفحة أيضاً بـ",
    sub: "شارك في إعادة كتابة منصّتين. أكثر من ٥ سنوات، يقيم في كوسوفو ويعمل عن بُعد.",
    flips: "من اليسار إلى اليمين",
    heroCaption: "مكتبة Bayyinah TV، تبويب دورات العربية. صفحات عامة.",
    altWeb: "مكتبة Bayyinah TV، تبويب العربية: دورات للمبتدئين والبرنامج الرئيسي للغة العربية",
    altPhone: "مكتبة Bayyinah TV بعرض الهاتف: تبويب العربية، وNew to Arabic، ودورتان للمبتدئين",
    rowsTitle: "التطبيقات، واللغات التي صدرت بها",
    langsLabel: "اللغات",
    albTitle: "بالألبانية",
    albLine: "تطبيقان بواجهة ألبانية: لعبة كلمات من صنعه، وتطبيق للبقالة.",
    fjaleCaption: "FJALË، لعبة كلمات يومية من صنعه، بلوحة مفاتيح ألبانية.",
    fjaleAlt: "لوحة لعبة FJALË: شبكة من خمسة أحرف، ولوحة مفاتيح ألبانية، ولوحة تلميحات",
    vivaCaption: "Viva Fresh، الشاشة الرئيسية، بواجهة ألبانية.",
    vivaAlt: "الشاشة الرئيسية لـ Viva Fresh: فئات المنتجات وأحدثها، بواجهة ألبانية",
    contact: "تواصل",
    footLine: "كل شاشة لعميل في هذه الصفحة صفحة عامة أو صورة من متجر التطبيقات.",
    archived: "مؤرشف",
    noLink: "بلا صفحات عامة",
    top: "جنتريت راشيتي، العودة إلى الأعلى",
    ownTitle: "منتجاته الخاصة",
    ownLine: "ثلاثة منتجات صنعها في وقته الخاص. اثنان منها مشروعان تصوّريان.",
    offdayKind: "إجازات للفرق: طلبات وموافقات وتقويم مشترك.",
    offdayResult: "نحو ٢٠٠ اختبار آلي، منها اختبارات تُبقي بيانات كل فريق خاصة به.",
    offdayNote: "منتج شخصي، ٢٠٢٦. الشيفرة خاصة.",
    offdayAlt: "تقويم الفريق في Offday لشهر أكتوبر ٢٠٢٦، مع الإجازات وعطلة رسمية وقائمة الموافقات",
    concept: "مشروع تصوّري",
    offbeatKind: "علامة سماعات متخيَّلة، مع آلة إيقاع من ثماني خطوات تعمل فعلاً.",
    offbeatAlt: "استوديو الصوت في OFFBEAT: آلة إيقاع من ثماني خطوات بصفوف الطبل والإيقاع والصنج والباص، مع السرعة ومستوى الصوت ومقبض التأرجح",
    formKind: "معرض منحوتات متخيَّل. ثلاثة أشكال من الرياضيات تُرسم مباشرة في المتصفح.",
    formAlt: "الصفحة الرئيسية لـ FORM: منحوتة عقدة ثلاثية من النحاس، والعنوان Objects of imagination، وعينات المواد",
  },
};

export interface RowLink {
  label: string;
  href: string;
  archived?: boolean;
}

export interface Row {
  id: string;
  name: Text;
  kind: Text;
  result: Text;
  role: Text;
  years: Text;
  /** Language names in their own scripts. `count` replaces them when the source gives only a number. */
  shipped: string[] | null;
  count?: Text;
  links: RowLink[];
}

const appStore = (href: string, archived = false): RowLink => ({ label: "App Store", href, archived });
const googlePlay = (href: string, archived = false): RowLink => ({ label: "Google Play", href, archived });

/** Language names that are not page languages, each in its own script. */
export const otherNames: Record<string, string> = {
  de: "Deutsch",
  es: "Español",
  tr: "Türkçe",
  fr: "Français",
};

export const rows: Row[] = [
  {
    id: "bayyinah",
    name: { en: "Bayyinah TV", sq: "Bayyinah TV", ar: "Bayyinah TV" },
    kind: {
      en: "A video-learning platform, rebuilt from an empty page.",
      sq: "Një platformë mësimi me video, e rindërtuar nga një faqe bosh.",
      ar: "منصة تعليم بالفيديو، أُعيد بناؤها من صفحة فارغة.",
    },
    result: {
      en: "The whole site also works in Arabic, right to left.",
      sq: "E gjithë faqja punon edhe në arabisht, nga e djathta në të majtë.",
      ar: "الموقع كله يعمل بالعربية أيضاً، من اليمين إلى اليسار.",
    },
    role: { en: "Frontend, core team", sq: "Frontend, ekipi bazë", ar: "الواجهة الأمامية، الفريق الأساسي" },
    years: { en: "2023–26", sq: "2023–26", ar: "٢٠٢٣–٢٦" },
    shipped: ["en", "ar"],
    links: [{ label: "bayyinahtv.com", href: "https://bayyinahtv.com/" }],
  },
  {
    id: "care",
    name: {
      en: "Care-management platform",
      sq: "Platformë për menaxhimin e kujdesit",
      ar: "منصة لإدارة الرعاية الصحية",
    },
    kind: {
      en: "Care teams follow patients’ health readings from home devices.",
      sq: "Ekipet e kujdesit ndjekin matjet e shëndetit të pacientëve nga pajisjet në shtëpi.",
      ar: "تتابع فرق الرعاية قراءات صحة المرضى من أجهزة في منازلهم.",
    },
    result: {
      en: "Many client organizations use it, in four languages.",
      sq: "E përdorin shumë organizata klientë, në katër gjuhë.",
      ar: "تستخدمها مؤسسات كثيرة من العملاء، بأربع لغات.",
    },
    role: {
      en: "Frontend, full stack since 2026",
      sq: "Frontend, full stack nga 2026",
      ar: "الواجهة الأمامية، وتطوير متكامل منذ ٢٠٢٦",
    },
    years: { en: "2023–now", sq: "2023–sot", ar: "٢٠٢٣ حتى الآن" },
    shipped: ["en", "de", "es", "tr"],
    links: [],
  },
  {
    id: "viva",
    name: { en: "Viva Fresh", sq: "Viva Fresh", ar: "Viva Fresh" },
    kind: {
      en: "Shoppers order groceries and pick a delivery time.",
      sq: "Blerësit porosisin ushqime dhe zgjedhin orarin e dorëzimit.",
      ar: "يطلب المتسوّقون البقالة ويختارون موعد التوصيل.",
    },
    result: {
      en: "One grocery app, built once for iPhone and Android.",
      sq: "Një aplikacion ushqimor, i ndërtuar një herë për iPhone dhe Android.",
      ar: "تطبيق بقالة واحد، بُني مرة واحدة لآيفون وأندرويد.",
    },
    role: { en: "Mobile", sq: "Mobile", ar: "تطبيقات الجوّال" },
    years: { en: "2023", sq: "2023", ar: "٢٠٢٣" },
    shipped: ["sq"],
    links: [
      appStore("https://apps.apple.com/us/app/viva-fresh/id1580739480"),
      googlePlay("https://play.google.com/store/apps/details?id=com.zs.vivafresh"),
    ],
  },
  {
    id: "read-to-feed",
    name: { en: "Read to Feed", sq: "Read to Feed", ar: "Read to Feed" },
    kind: {
      en: "A reading app for children. Books open inside the app.",
      sq: "Një aplikacion leximi për fëmijë. Librat hapen brenda aplikacionit.",
      ar: "تطبيق قراءة للأطفال. تُفتح الكتب داخل التطبيق.",
    },
    result: {
      en: "About 14 updates in both app stores.",
      sq: "Rreth 14 përditësime në të dy dyqanet e aplikacioneve.",
      ar: "نحو ١٤ تحديثاً في متجرَي التطبيقات.",
    },
    role: { en: "Mobile, iOS and Android", sq: "Mobile, iOS dhe Android", ar: "الجوّال، iOS وAndroid" },
    years: { en: "2022–25", sq: "2022–25", ar: "٢٠٢٢–٢٥" },
    shipped: null,
    count: { en: "3 languages", sq: "3 gjuhë", ar: "٣ لغات" },
    links: [
      appStore("https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765", true),
      googlePlay("https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf", true),
    ],
  },
  {
    id: "incentiv",
    name: { en: "Incentiv", sq: "Incentiv", ar: "Incentiv" },
    kind: {
      en: "Screens for a crypto wallet. Teammates built the wallet.",
      sq: "Ekranet për një portofol kripto. Kolegët ndërtuan portofolin.",
      ar: "شاشات لمحفظة عملات رقمية. بنى الزملاء المحفظة نفسها.",
    },
    result: {
      en: "Sign in with a passkey (no password) or a wallet.",
      sq: "Hyrje me passkey (pa fjalëkalim) ose me një portofol.",
      ar: "دخول بمفتاح مرور (بلا كلمة سر) أو بمحفظة.",
    },
    role: { en: "Frontend", sq: "Frontend", ar: "الواجهة الأمامية" },
    years: { en: "2024", sq: "2024", ar: "٢٠٢٤" },
    shipped: ["en", "fr"],
    links: [{ label: "incentiv.io", href: "https://incentiv.io/" }],
  },
  {
    id: "fjale",
    name: { en: "FJALË", sq: "FJALË", ar: "FJALË" },
    kind: {
      en: "His own daily word game, in Albanian.",
      sq: "Loja e tij ditore me fjalë, në shqip.",
      ar: "لعبة كلمات يومية من صنعه، بالألبانية.",
    },
    result: {
      en: "A new five-letter word every day, live on the web.",
      sq: "Një fjalë e re me pesë shkronja çdo ditë, në internet.",
      ar: "كلمة جديدة من خمسة أحرف كل يوم، على الويب.",
    },
    role: { en: "Own project", sq: "Projekt personal", ar: "مشروع شخصي" },
    years: { en: "2026", sq: "2026", ar: "٢٠٢٦" },
    shipped: ["sq"],
    links: [{ label: "fjalë.com", href: "https://xn--fjal-opa.com/" }],
  },
];
