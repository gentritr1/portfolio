# Loading the display face without a jump

A multi-line claim in a condensed or wide display face reflows badly when the web font swaps in. Two patterns work; `font-display: optional` alone does not on a lazy route (on a cold load the fallback stays for the whole visit, and every capture shows the wrong face).

## 1. Swap + preload + a fallback sized to the claim (preferred)

```css
@font-face {
  font-family: "Claim Display";
  src: url("/fonts/creative/BigShouldersDisplay-Latin.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
/* A local face scaled so the claim keeps the same line breaks before the swap. */
@font-face {
  font-family: "Claim Display Fallback";
  src: local("Arial Narrow"), local("Helvetica Neue Condensed"), local("Arial");
  size-adjust: 77.5%;      /* measured on the claim string itself, not on mixed text */
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
.claim { font-family: "Claim Display", "Claim Display Fallback", sans-serif; }
```

```html
<link rel="preload" href="/fonts/creative/BigShouldersDisplay-Latin.woff2" as="font" type="font/woff2" crossorigin>
```

Measure `size-adjust` on the exact claim: render it once in the web font and once in the fallback (`canvas.measureText` or two hidden spans), divide the widths. Measuring generic text can change the line count of the real claim (one builder saw 74% give 5 lines where 77.5% gave 4 and CLS 0).

## 2. Hold the first paint briefly (when the claim is the whole first screen)

```ts
// Before the first render of the draft root:
await Promise.race([
  document.fonts.load('700 64px "Claim Display"'),
  new Promise((r) => setTimeout(r, 700)), // never wait longer than 700 ms
]);
```

Use it only when the claim is the first-screen picture. Never block longer than 700 ms; after that, the fallback from pattern 1 shows.

## Check

`check.mjs` reports which face actually rendered at capture time; if the display face had not loaded, fix the loading, not the checker.
