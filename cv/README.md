# Application materials

`Gentrit-Rashiti-CV.html` is the editable source of truth for CV copy. `build_pdf.py` reads its headings, paragraphs, bullets and links and renders the site's downloadable `public/Gentrit-Rashiti-CV.pdf`. The build fails if the copy exceeds one page, before replacing the previous PDF.

Run `python3 cv/build_pdf.py` with ReportLab installed. The current renderer uses macOS Arial font files; if building on another OS, update `font_dir` and font filenames to installed, licensed TrueType equivalents. Render the PDF with Poppler and inspect it after changing copy or typography. Check extracted text and hyperlinks as well as appearance.

`portfolio-share.html` is the source for the 1200 × 630 sharing image. Serve it through Vite at `/cv/portfolio-share.html`, wait for the local font and product image, and capture the viewport at exactly 1200 × 630. The current browser capture is JPEG at `public/og-image.jpg`, referenced by `index.html`. The older `scripts/generate-og.py` produces a different legacy card; it is not the source of the current sharing image.

The CV includes the confirmed public URL https://www.gentrit.tech. Regenerate and visually inspect the PDF whenever copy changes. Social-image URLs are made absolute by the Vite build.
