"""Refresh content versions after local CSS/JS/image edits; no site build needed."""
from pathlib import Path
import hashlib
import re

ROOT=Path(__file__).resolve().parent.parent


def version(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()[:12]


base=ROOT/'assets/base.css'
text=base.read_text(encoding='utf-8')
text=re.sub(r"url\('([^'?]+)(?:\?v=[a-f0-9]+)?'\)",lambda m: "url('"+m[1]+'?v='+version(base.parent/m[1])+"')",text)
base.write_text(text,encoding='utf-8',newline='\n')
for page in list(ROOT.glob('*.html'))+list((ROOT/'es').glob('*.html')):
    text=page.read_text(encoding='utf-8')
    # Attribute URLs and srcset candidates; JSON-LD/OG absolute URLs stay intact.
    pattern=r'((?:\.\./)?assets/[^\s"<>?,]+\.(?:css|js|woff2|avif|webp|svg))(?:\?v=[a-f0-9]+)?'
    def asset(match):
        url=match[1]
        file=(page.parent/url).resolve()
        return url+'?v='+version(file) if file.is_file() else match[0]
    text=re.sub(pattern,asset,text)
    page.write_text(text,encoding='utf-8',newline='\n')
print('Updated stylesheet, script, font and image content versions on all 12 pages.')
