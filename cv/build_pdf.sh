#!/bin/sh
# Print the CV page to the site's PDF with headless Chrome; fail unless it is one page.
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="${TMPDIR:-/tmp}/cv-build.pdf"
"$CHROME" --headless=new --no-pdf-header-footer --virtual-time-budget=5000 \
  --user-data-dir="${TMPDIR:-/tmp}/cv-chrome" --print-to-pdf="$OUT" "file://$PWD/cv/Gentrit-Rashiti-CV.html" 2>/dev/null
PAGES=$(grep -ao '/Count [0-9]*' "$OUT" | head -1 | cut -d' ' -f2)
[ "$PAGES" = 1 ] || { echo "CV is $PAGES pages, expected 1" >&2; exit 1; }
mv "$OUT" public/Gentrit-Rashiti-CV.pdf
echo "public/Gentrit-Rashiti-CV.pdf: 1 page"
