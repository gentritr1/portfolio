# Creative draft fonts

Downloaded on 2026-10-04 from the official GitHub and Google Fonts repositories linked below. These files are self-hosted assets; the website does not need a font CDN.

All font software in this directory is distributed under the **SIL Open Font License 1.1**. The unmodified upstream copyright and license files are included beside each family. The original files are pinned by repository revision and SHA-256 below.

## Local files and retained design space

| Upstream design | Local CSS family | File | Bytes | Retained axes | Frozen axes |
| --- | --- | --- | ---: | --- | --- |
| Hubot Sans | `Gentrit Display` | [GentritDisplay-Latin.woff2](GentritDisplay-Latin.woff2) | 84,120 | `wdth` 80–120, `wght` 200–900 | `ital` 0 |
| Mona Sans | `Gentrit Text` | [GentritText-Latin.woff2](GentritText-Latin.woff2) | 41,172 | `wght` 200–900 | `ital` 0, `opsz` 14, `wdth` 100 |
| JetBrains Mono | `JetBrains Mono` | [JetBrainsMono-Latin.woff2](JetBrainsMono-Latin.woff2) | 42,388 | `wght` 100–800 | None |
| Libre Franklin | `Libre Franklin` | [LibreFranklin-Latin.woff2](LibreFranklin-Latin.woff2) | 28,692 | `wght` 100–900 | None |
| Fraunces | `Fraunces` | [Fraunces-Latin.woff2](Fraunces-Latin.woff2) | 64,212 | `opsz` 9–144, `wght` 100–900 | `SOFT` 100, `WONK` 1 |
| Bricolage Grotesque | `Bricolage Grotesque` | [BricolageGrotesque-Latin.woff2](BricolageGrotesque-Latin.woff2) | 74,432 | `opsz` 12–96, `wght` 200–800 | `wdth` 100 |
| IBM Plex Mono | `Gentrit Technical Mono` | [GentritTechnicalMono-Latin.woff2](GentritTechnicalMono-Latin.woff2) | 10,288 | Static 400 | None |
| Anton | `Anton` | [Anton-Latin.woff2](Anton-Latin.woff2) | 11,340 | Static 400 | None |
| Public Sans | `Public Sans` | [PublicSans-Latin.woff2](PublicSans-Latin.woff2) | 25,164 | `wght` 100–900 | None |
| Courier Prime | `Courier Prime` | [CourierPrime-Latin.woff2](CourierPrime-Latin.woff2) | 11,320 | Static 400 | None |

The Hubot Sans, Mona Sans and IBM Plex Mono licenses reserve the names “Hubot”, “Mona” and “Plex”. Their modified subsets are therefore named **Gentrit Display**, **Gentrit Text** and **Gentrit Technical Mono**, including their internal family, full, PostScript and instance naming records. These are local subsets of the credited designs, not independent original typefaces. Copyright, author and license records remain intact.

Mona is fixed at optical size 14 and width 100 for body copy. Hubot retains width for the DIFF display composition. Fraunces keeps optical size and weight, with softness 100 and wonk 1 for the brief’s soft serif clues. Bricolage Grotesque keeps optical size and weight and uses its normal width. Upright regular files are supplied for the three static families; unused italic and extra static weights are not bundled.

## Embedding

Use the local family names above in `@font-face` and `font-family`, `format("woff2")`, `font-display: swap` and `font-style: normal`. Declare the weight ranges from the table. Gentrit Display also needs `font-stretch: 80% 120%` on its face declaration; choose the intended width explicitly in the design. The other delivered files use normal width. Use `font-optical-sizing: auto` for Fraunces and Bricolage Grotesque when their optical axis should follow the text size.

The upstream variable defaults are not always regular: Hubot starts at width 80 and weight 200; Mona starts at weight 200; Libre Franklin and Public Sans start at weight 100; Fraunces starts at weight 900 and Bricolage Grotesque at weight 800. Normal CSS weight declarations should select the intended value; set `font-weight` explicitly for each role rather than relying on the raw font default.

## Character coverage

Every delivered file retains `Ë ë Ç ç`. The subset requests Basic Latin, Latin-1, common punctuation, currency and the arrow block; only characters present in the original font are kept. No glyphs were copied between families. The files are deliberately not exhaustive Latin Extended, Greek, Cyrillic or Arabic subsets.

| Family | Ë / ë / Ç / ç | ← ↑ → ↓ | ↗ | ✓ |
| --- | --- | --- | --- | --- |
| Gentrit Display | Yes | Yes | Not in upstream | Yes |
| Gentrit Text | Yes | Yes | Not in upstream | Yes |
| JetBrains Mono | Yes | Yes | Yes | Yes |
| Libre Franklin | Yes | Not in upstream | Not in upstream | Not in upstream |
| Fraunces | Yes | Not in upstream | Not in upstream | Not in upstream |
| Bricolage Grotesque | Yes | Yes | Not in upstream | Not in upstream |
| Gentrit Technical Mono | Yes | Yes | Yes | Yes |
| Anton | Yes | Yes | Not in upstream | Not in upstream |
| Public Sans | Yes | Not in upstream | Not in upstream | Not in upstream |
| Courier Prime | Yes | Not in upstream | Not in upstream | Not in upstream |

Use the project’s vector icons for arrows/checks, or an explicit `Gentrit Technical Mono` / `JetBrains Mono` fallback for those characters. The IBM-derived file is 10,288 bytes and includes all the symbols listed above.

## Reproduction notes

Generated with fontTools 4.66.1. Start with each pinned TTF, freeze only the axes listed above with `fontTools.varLib.instancer.instantiateVariableFont`, save and reload the instance, subset, and write WOFF2. Font hinting is removed; default shaping features and kerning are retained. Preserve all name IDs and languages, except the reserved-name naming records that are replaced as described above. Copyright/license text and URLs are retained. Timestamp recalculation is disabled.

Exact requested Unicode set (absent upstream codepoints are ignored):

```text
U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,
U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-21FF,
U+2212,U+2215,U+25A0-25A1,U+25B2,U+25B6,U+25BC,U+25CF,
U+2713-2714,U+FEFF,U+FFFD
```

## Pinned upstream sources and licenses

### Hubot Sans

- Repository: [github/hubot-sans](https://github.com/github/hubot-sans)
- Revision: `d4b2f67cd7686f5907296d3f027112bbc4f69f42`
- Source TTF: [fonts/variable/HubotSansVF-Regular.ttf](https://raw.githubusercontent.com/github/hubot-sans/d4b2f67cd7686f5907296d3f027112bbc4f69f42/fonts/variable/HubotSansVF-Regular.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/github/hubot-sans/d4b2f67cd7686f5907296d3f027112bbc4f69f42/OFL.txt) · [included copy](HubotSans-OFL.txt)
- Source SHA-256: `9887a667164b597693b3200fe8573e8505cf33296b8a6e3a2da4fcaba50a0492`
- Local WOFF2 SHA-256: `9baea4c498363d8bbaa6b5135c23b8af393bf0646d91327e693f2c341b79b5cb`

### Mona Sans

- Repository: [github/mona-sans](https://github.com/github/mona-sans)
- Revision: `4bc6ba8b354c36b4fb66d32cd67b4c1f2beb0a06`
- Source TTF: [fonts/variable/MonaSansVF[wdth,wght,opsz,ital].ttf](https://raw.githubusercontent.com/github/mona-sans/4bc6ba8b354c36b4fb66d32cd67b4c1f2beb0a06/fonts/variable/MonaSansVF%5Bwdth%2Cwght%2Copsz%2Cital%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/github/mona-sans/4bc6ba8b354c36b4fb66d32cd67b4c1f2beb0a06/OFL.txt) · [included copy](MonaSans-OFL.txt)
- Source SHA-256: `ade8e0e711f2798266e12f02b271aba1c345c5a38be4e98cb72d198248ccc8a7`
- Local WOFF2 SHA-256: `48f52546d6564f62de3ba38bbb0a29ca8becb9d8a436472a08c853a41058870e`

### JetBrains Mono

- Repository: [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono)
- Revision: `19371302b95d218af43299bce79ddbddd0bc364d`
- Source TTF: [fonts/variable/JetBrainsMono[wght].ttf](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/19371302b95d218af43299bce79ddbddd0bc364d/fonts/variable/JetBrainsMono%5Bwght%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/19371302b95d218af43299bce79ddbddd0bc364d/OFL.txt) · [included copy](JetBrainsMono-OFL.txt)
- Source SHA-256: `3cfafa86e28b87184d592fef82846e8c10cb48653c62efcda34f082da225ec34`
- Local WOFF2 SHA-256: `33c26902e3e0e8765b318b92c09a9821ba2491a0a140244b5a7d34c165b65778`

### Libre Franklin

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/librefranklin/LibreFranklin[wght].ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/librefranklin/LibreFranklin%5Bwght%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/librefranklin/OFL.txt) · [included copy](LibreFranklin-OFL.txt)
- Source SHA-256: `2329f394b10ed1c71107df20fddc11e2bb1b68c1ecbb385f975b36fd64a971f8`
- Local WOFF2 SHA-256: `67f4888fb850b21870fb120c7ad4a821bba3926c7077bde22e34f9dd3f031f55`

### Fraunces

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/fraunces/OFL.txt) · [included copy](Fraunces-OFL.txt)
- Source SHA-256: `177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb`
- Local WOFF2 SHA-256: `21e228541100eb1054ee4dc17f76255e704ca499ce127be0e8e63549f633e1f2`

### Bricolage Grotesque

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/bricolagegrotesque/OFL.txt) · [included copy](BricolageGrotesque-OFL.txt)
- Source SHA-256: `413e7357809ddd12fd80a96a8a396de0e401638d4acd3cb3e37532f0472ac682`
- Local WOFF2 SHA-256: `e1e741072912b7a56bde91f996351a2d141adaf13dbe1c1f804b2de57ccbe3c5`

### IBM Plex Mono

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/ibmplexmono/IBMPlexMono-Regular.ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/ibmplexmono/IBMPlexMono-Regular.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/ibmplexmono/OFL.txt) · [included copy](IBMPlexMono-OFL.txt)
- Source SHA-256: `6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46`
- Local WOFF2 SHA-256: `d5648175bdafdba9bfa72f0bad049b129c2d8e59e0cf96ffd27d898958df1fa1`

### Anton

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/anton/Anton-Regular.ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/anton/Anton-Regular.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/anton/OFL.txt) · [included copy](Anton-OFL.txt)
- Source SHA-256: `a4ba3a92350ebb031da0cb47630ac49eb265082ca1bc0450442f4a83ab947cab`
- Local WOFF2 SHA-256: `c819366b84466ffee7a672d6e70a42c3b9b6c0cceb6448ef84bc12317465e033`

### Public Sans

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/publicsans/PublicSans[wght].ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/publicsans/PublicSans%5Bwght%5D.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/publicsans/OFL.txt) · [included copy](PublicSans-OFL.txt)
- Source SHA-256: `d75a7dc1a27eb9e336d5b33f55489d2ecb5621bf694d5c43b2415bce2ca830a8`
- Local WOFF2 SHA-256: `f7d4054883cf971ef9867ecbb0ddea60907f08fd5a51b49907fa367c8d72aef5`

### Courier Prime

- Repository: [google/fonts](https://github.com/google/fonts)
- Revision: `9710da1eacb3be272583c3224dcb70f9da6eadbb`
- Source TTF: [ofl/courierprime/CourierPrime-Regular.ttf](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/courierprime/CourierPrime-Regular.ttf)
- License: [exact upstream OFL 1.1](https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/courierprime/OFL.txt) · [included copy](CourierPrime-OFL.txt)
- Source SHA-256: `72f793376f8e2841656bf21d77a5de010f2929bd6956a22ee848ad0c7eb978af`
- Local WOFF2 SHA-256: `e73c41403397f52a7b0c1d869cb85a88b3a21fb0aeaf9bd3fcc52460ce9da3a8`
