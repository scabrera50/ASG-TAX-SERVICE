import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('irs_news', Path(__file__).with_name('update-irs-news.py'))
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)


def release(title, code, date, url='/newsroom/example'):
    return f'<div><h2><a href="{url}"><span>{title}</span></a></h2><div class="field--name-field-pup-description-abstract">{code}, {date} — Official announcement.</div></div>'


def document(*releases):
    return '<article about="/newsroom/news-releases-for-current-month">' + ''.join(releases) + '</article>'


class FeedTests(unittest.TestCase):
    def test_dates_entities_deduplication_and_order(self):
        html = document(release('Older', 'IR-2026-1', 'Oct. 1, 2026', '/newsroom/older'), release('New &amp; updated', 'IR-2026-2', 'October 2, 2026', '/newsroom/new'))
        feed = news.build_feed(html, checked_at='2026-10-27T12:00:00+00:00')
        self.assertEqual([item['published'] for item in feed['items']], ['2026-10-02', '2026-10-01'])
        self.assertEqual(feed['items'][0]['title'], 'New & updated')
        self.assertEqual(len(news.build_feed(html, feed)['items']), 2)

    def test_rollover_keeps_previous_month_until_new_items_arrive(self):
        previous = news.build_feed(document(release('October', 'IR-2026-100', 'Oct. 31, 2026', '/newsroom/october')))
        feed = news.build_feed(document(release('November', 'IR-2026-101', 'Nov. 1, 2026', '/newsroom/november')), previous)
        self.assertEqual([item['title'] for item in feed['items']], ['November', 'October'])

    def test_month_without_space_before_day(self):
        feed = news.build_feed(document(release('Record year', 'IR-2026-129', 'Oct.29, 2026')))
        self.assertEqual(feed['items'][0]['published'], '2026-10-29')

    def test_one_unreadable_date_is_skipped_not_fatal(self):
        html = document(release('Readable', 'IR-2026-1', 'Oct. 1, 2026', '/newsroom/readable'), release('Garbled', 'IR-2026-2', 'sometime soon', '/newsroom/garbled'), release('Bad month', 'IR-2026-3', 'Foo. 3, 2026', '/newsroom/bad-month'))
        feed = news.build_feed(html)
        self.assertEqual([item['title'] for item in feed['items']], ['Readable'])

    def test_empty_or_changed_source_fails_instead_of_claiming_freshness(self):
        with self.assertRaises(ValueError):
            news.build_feed('<article>Unavailable</article>')

    def test_external_and_script_links_are_rejected(self):
        for url in ['https://www.irs.gov.attacker.example/newsroom/foo', 'javascript:alert(1)', 'http://www.irs.gov/newsroom/foo', 'https://www.irs.gov@example.com/newsroom/foo']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                news.build_feed(document(release('Unsafe', 'IR-2026-1', 'Oct. 1, 2026', url)))

    def test_archive_teaser_is_not_mistaken_for_a_dated_release(self):
        archive = '<h2><a href="/newsroom/archive">Archive</a></h2><div class="field--name-field-pup-description-abstract">Previous years.</div>'
        feed = news.build_feed(document(release('Current', 'IR-2026-1', 'Oct. 1, 2026'), archive))
        self.assertEqual(len(feed['items']), 1)


if __name__ == '__main__':
    unittest.main()
