#!/usr/bin/env python3
"""Ekstrakcja strategii z strategia.html (inline JS) do Markdown."""
import re
from pathlib import Path

DASH = Path(__file__).parent.parent
html_file = DASH / "strategia.html"
html = html_file.read_text()

match = re.search(r'STRATEGIA_CONTENT\s*=\s*`(.*?)`', html, re.DOTALL)
if not match:
    print("ERROR: nie znaleziono STRATEGIA_CONTENT w strategia.html")
    exit(1)

content = match.group(1)


def table_to_md(html_table):
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html_table, re.DOTALL)
    md = []
    for i, row in enumerate(rows):
        cells = re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', row, re.DOTALL)
        cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
        md.append('| ' + ' | '.join(cells) + ' |')
        if i == 0:
            md.append('|' + '---|' * len(cells))
    return '\n'.join(md)


content = re.sub(r'<table[^>]*>.*?</table>', lambda m: table_to_md(m.group(0)), content, flags=re.DOTALL)
content = re.sub(r'<h2>(.*?)</h2>', r'\n## \1\n', content)
content = re.sub(r'<h3>(.*?)</h3>', r'\n### \1\n', content)
content = re.sub(r'<h4>(.*?)</h4>', r'\n#### \1\n', content)
content = re.sub(r'<strong>(.*?)</strong>', r'**\1**', content)
content = re.sub(r'<em>(.*?)</em>', r'*\1*', content)
content = re.sub(r'<li>(.*?)</li>', r'- \1', content)
content = re.sub(r'</?(?:ol|ul|p)>', '', content)
content = re.sub(r'<br\s*/?>', '\n', content)
content = re.sub(r'<[^>]+>', '', content)
content = re.sub(r'\n{3,}', '\n\n', content)
content = content.strip()

content = content.replace("12 aktywnych usług", "10 aktywnych usług")

out = DASH / "_zrodla/strategia_plaintext.md"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(content)
print(f"✓ Wyekstrakowano: {out} ({len(content)} znaków)")
