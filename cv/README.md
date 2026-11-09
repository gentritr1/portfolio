# Application materials

`Gentrit-Rashiti-CV.html` is the editable source of truth for the CV, copy and layout. `build_pdf.sh` prints it with headless Chrome (Outfit and Inter load from Google Fonts) to the site's downloadable `public/Gentrit-Rashiti-CV.pdf`, and fails before replacing it if the result is not one page.

Run `sh cv/build_pdf.sh` on macOS with Google Chrome installed (set `CHROME` to another Chrome binary elsewhere). Open the PDF and check it after changing copy or spacing.

`portfolio-share.html` is the source for the 1200 × 630 sharing image. Serve it through Vite at `/cv/portfolio-share.html`, wait for the local font and product image, and capture the viewport at exactly 1200 × 630. The current browser capture is JPEG at `public/og-image.jpg`, referenced by `index.html`. The older `scripts/generate-og.py` produces a different legacy card; it is not the source of the current sharing image.

The CV includes the confirmed public URL https://www.gentrit.tech. Regenerate and visually inspect the PDF whenever copy changes. Social-image URLs are made absolute by the Vite build.
