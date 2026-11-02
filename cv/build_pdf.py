"""Build the downloadable CV from its HTML copy, checking it fits one page.

Requires reportlab. Run from any directory: python3 cv/build_pdf.py
The HTML is the only copy source; PDF typography is defined here.
"""

from html import escape
from html.parser import HTMLParser
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph

ROOT = Path(__file__).resolve().parent.parent


class CopyParser(HTMLParser):
    """Read visible text blocks and preserve only bold text and links."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.current = None
        self.fragments = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main':
            self.in_main = True
        if not self.in_main:
            return
        if tag in ('h1', 'h2', 'h3', 'p', 'li'):
            if self.current:
                raise ValueError('Nested copy blocks are not supported')
            self.current = (tag, attrs.get('class', ''))
            self.fragments = []
        elif self.current and tag in ('strong', 'b'):
            self.fragments.append('<b>')
        elif self.current and tag == 'a':
            self.fragments.append(f'<link href="{escape(attrs["href"], quote=True)}" color="#116c70">')

    def handle_endtag(self, tag):
        if tag == 'main':
            self.in_main = False
        if not self.current:
            return
        if tag == self.current[0]:
            self.blocks.append((*self.current, ''.join(self.fragments)))
            self.current = None
        elif tag in ('strong', 'b'):
            self.fragments.append('</b>')
        elif tag == 'a':
            self.fragments.append('</link>')

    def handle_data(self, data):
        if self.current:
            self.fragments.append(escape(data))


def build():
    # Embedded fonts keep rendering consistent and preserve text extraction.
    font_dir = Path('/System/Library/Fonts/Supplemental')
    pdfmetrics.registerFont(TTFont('CV', str(font_dir / 'Arial.ttf')))
    pdfmetrics.registerFont(TTFont('CVBold', str(font_dir / 'Arial Bold.ttf')))
    pdfmetrics.registerFontFamily('CV', normal='CV', bold='CVBold', italic='CV', boldItalic='CVBold')
    ink, accent, muted = (HexColor(x) for x in ('#152c36', '#116c70', '#52646e'))
    base = ParagraphStyle('base', fontName='CV', fontSize=9.4, leading=12.6, textColor=ink, spaceAfter=3)
    styles = {
        'h1': ParagraphStyle('name', parent=base, fontName='CVBold', fontSize=24, leading=28, spaceAfter=3),
        'role': ParagraphStyle('role', parent=base, fontSize=11, leading=15, textColor=accent, spaceAfter=4),
        'contact': ParagraphStyle('contact', parent=base, fontSize=8.5, leading=11, textColor=muted, spaceAfter=2),
        'h2': ParagraphStyle('section', parent=base, fontName='CVBold', fontSize=10.6, leading=14, textColor=accent, spaceBefore=8, spaceAfter=4),
        'h3': ParagraphStyle('job', parent=base, fontName='CVBold', fontSize=9.5, leading=13, spaceAfter=2),
        'job-meta': ParagraphStyle('dates', parent=base, fontSize=8.6, leading=11.5, textColor=muted, spaceAfter=4),
        'li': ParagraphStyle('point', parent=base, leftIndent=10, bulletIndent=0, bulletFontName='CV', bulletFontSize=8, spaceAfter=4),
        'languages': ParagraphStyle('languages', parent=base, fontSize=8.6, leading=11.5, textColor=muted, spaceBefore=5),
    }
    parser = CopyParser()
    parser.feed((ROOT / 'cv/Gentrit-Rashiti-CV.html').read_text())
    story = []
    for tag, cls, text in parser.blocks:
        style = styles.get(cls, styles.get(tag, base))
        story.append(Paragraph(text, style, bulletText='•' if tag == 'li' else None))

    target = ROOT / 'public/Gentrit-Rashiti-CV.pdf'
    pending = target.with_suffix('.pending.pdf')
    width, height = 595.276, 841.89
    document = canvas.Canvas(str(pending), pagesize=(width, height))
    document.setTitle('Gentrit Rashiti - Software Engineer')
    document.setAuthor('Gentrit Rashiti')
    frame = Frame(42, 34, width - 84, height - 70, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frame.addFromList(story, document)
    if story:
        raise ValueError(f'CV exceeds one page: {len(story)} blocks remain. Shorten copy or revise spacing.')
    document.showPage()
    document.save()
    pending.replace(target)
    print(target)


if __name__ == '__main__':
    build()
