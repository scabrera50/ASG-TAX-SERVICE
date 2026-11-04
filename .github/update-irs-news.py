"""Refresh public IRS headlines without adding a website backend or dependencies."""
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
import json
import re
import sys

SOURCE = 'https://www.irs.gov/newsroom/news-releases-for-current-month'
DESTINATION = Path(__file__).resolve().parent.parent / 'assets' / 'irs-news.json'


def official_news_url(value):
    url = urljoin(SOURCE, value)
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.netloc != 'www.irs.gov' or not parsed.path.startswith('/newsroom/'):
        raise ValueError('IRS news link is outside the official newsroom')
    return url


def parse_date(value):
    # The IRS sometimes omits the space after an abbreviated month ("Oct.29").
    match = re.search(r'(IR-\d{4}-\d+),\s*([A-Za-z]+)\.?\s*(\d{1,2}),\s*(\d{4})', value)
    if not match:
        raise ValueError('IRS publication date not found')
    code, month, day, year = match.groups()
    months = {name: n for n, name in enumerate(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'], 1)}
    if month.lower()[:3] not in months:
        raise ValueError('IRS publication month not recognized')
    return code, datetime(int(year), months[month.lower()[:3]], int(day)).date().isoformat()


class NewsParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.inside = False
        self.heading = False
        self.title_parts = None
        self.current = None
        self.abstract_parts = None
        self.abstract_depth = 0
        self.items = []
        self.skipped = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and attrs.get('about') == '/newsroom/news-releases-for-current-month':
            self.inside = True
        if not self.inside:
            return
        if tag == 'h2':
            self.heading = True
        if tag == 'a' and self.heading and attrs.get('href'):
            self.current = {'url': official_news_url(attrs['href'])}
            self.title_parts = []
        if tag == 'div':
            if self.abstract_parts is not None:
                self.abstract_depth += 1
            elif 'field--name-field-pup-description-abstract' in attrs.get('class', '').split():
                self.abstract_parts = []
                self.abstract_depth = 1

    def handle_data(self, value):
        if self.title_parts is not None:
            self.title_parts.append(value)
        if self.abstract_parts is not None:
            self.abstract_parts.append(value)

    def handle_endtag(self, tag):
        if tag == 'a' and self.title_parts is not None:
            self.current['title'] = ' '.join(''.join(self.title_parts).split())
            self.title_parts = None
        if tag == 'h2':
            self.heading = False
        if tag == 'div' and self.abstract_parts is not None:
            self.abstract_depth -= 1
            if self.abstract_depth == 0:
                abstract = ''.join(self.abstract_parts)
                if self.current and self.current.get('title') and re.search(r'IR-\d{4}-\d+', abstract):
                    # Skip one unreadable date rather than stopping the whole refresh.
                    try:
                        code, published = parse_date(abstract)
                    except ValueError as error:
                        self.skipped.append(f"{self.current['title']}: {error}")
                    else:
                        self.items.append({**self.current, 'id': code, 'published': published})
                self.current = None
                self.abstract_parts = None
        if tag == 'article':
            self.inside = False


def build_feed(html, previous=None, checked_at=None):
    parser = NewsParser()
    parser.feed(html)
    for skipped in parser.skipped:
        print(f'Skipped IRS release with an unreadable date: {skipped}', file=sys.stderr)
    if not parser.items:
        raise ValueError('No dated IRS news releases found; keeping the last successful feed')
    old = (previous or {}).get('items', [])
    items = {}
    for item in old + parser.items:
        official_news_url(item['url'])
        if not item.get('title') or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', item.get('published', '')):
            raise ValueError('Invalid feed item')
        items[item['url']] = item
    latest = sorted(items.values(), key=lambda item: (item['published'], int(item['id'].rsplit('-', 1)[-1])), reverse=True)[:6]
    return {'source': SOURCE, 'checkedAt': checked_at or datetime.now(timezone.utc).isoformat(timespec='seconds'), 'items': latest}


def main():
    # A local HTML fixture supports reproducible parser tests and preview seeding.
    if len(sys.argv) == 3 and sys.argv[1] == '--from-file':
        html = Path(sys.argv[2]).read_text(encoding='utf-8')
    elif len(sys.argv) == 1:
        request = Request(SOURCE, headers={'User-Agent': 'ASG-Tax-Services-News/1.0 (public IRS headlines)', 'Accept':'text/html'})
        with urlopen(request, timeout=30) as response:
            if response.status != 200:
                raise ValueError(f'IRS returned HTTP {response.status}')
            html = response.read(2_000_001).decode('utf-8')
            if len(html) > 2_000_000:
                raise ValueError('IRS response exceeds expected size')
    else:
        raise ValueError('Usage: update-irs-news.py [--from-file path]')
    previous = json.loads(DESTINATION.read_text(encoding='utf-8')) if DESTINATION.exists() else None
    feed = build_feed(html, previous)
    temporary = DESTINATION.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(DESTINATION)
    print(f"Refreshed {len(feed['items'])} official IRS headlines; checked {feed['checkedAt']}")


if __name__ == '__main__':
    main()
