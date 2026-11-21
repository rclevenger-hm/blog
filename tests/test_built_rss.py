import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check-built-rss.py"
SITE = "https://rclevenger-hm.github.io/blog/"


class BuiltRssTests(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.cwd = Path(temp.name)
        self.feed = self.cwd / "dist" / "rss.xml"
        self.root = ET.Element("rss", version="2.0")
        self.channel = ET.SubElement(self.root, "channel")
        for key, value in {"title": "Engineering", "link": SITE, "description": "Tips & notes"}.items():
            ET.SubElement(self.channel, key).text = value

        for slug, date in (
            ("guides/writing", "Mon, 02 Nov 2026 08:00:00 +0000"),
            ("testing", "Mon, 02 Nov 2026 02:00:00 -0600"),  # same instant
        ):
            route = self.cwd / "dist" / "posts" / slug / "index.html"
            route.parent.mkdir(parents=True)
            route.touch()
            link = SITE + "posts/" + slug + "/"
            item = ET.SubElement(self.channel, "item")
            for key, value in {
                "title": "Publishing & validation",
                "description": "A fixture.",
                "link": link,
                "guid": link,
                "pubDate": date,
            }.items():
                ET.SubElement(item, key).text = value

    def run_check(self, *, save=True):
        if save:
            ET.ElementTree(self.root).write(self.feed, encoding="utf-8")
        return subprocess.run(
            [sys.executable, os.fspath(SCRIPT)], cwd=self.cwd, capture_output=True, text=True
        )

    def assert_failure(self, result, reason):
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(reason, result.stderr)

    def test_valid_nested_routes_and_equivalent_date_offsets(self):
        result = self.run_check()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("all 2 published articles", result.stdout)

    def test_missing_and_duplicate_posts(self):
        first, second = self.channel.findall("item")
        self.channel.remove(second)
        self.channel.append(first)
        result = self.run_check()
        self.assert_failure(result, "duplicate URL")
        self.assertIn("missing article", result.stderr)

    def test_wrong_base_and_unbuilt_route(self):
        first, second = self.channel.findall("item")
        for item, link in (
            (first, "https://rclevenger-hm.github.io/posts/guides/writing/"),
            (second, SITE + "posts/not-built/"),
        ):
            item.find("link").text = link
            item.find("guid").text = link
        result = self.run_check()
        self.assert_failure(result, "not a built article URL")
        self.assertIn("posts/guides/writing/", result.stderr)
        self.assertIn("posts/not-built/", result.stderr)

    def test_required_metadata_permalink_and_zoned_dates(self):
        first, second = self.channel.findall("item")
        first.find("description").text = " "
        first.find("guid").set("isPermaLink", "false")
        second.find("pubDate").text = "Mon, 02 Nov 2026 08:00:00"
        result = self.run_check()
        self.assert_failure(result, "expected one nonempty description")
        self.assertIn("GUID must equal its article permalink", result.stderr)
        self.assertIn("invalid publication date", result.stderr)

    def test_out_of_order_dates(self):
        self.channel.findall("item")[1].find("pubDate").text = "Mon, 02 Nov 2026 03:00:00 -0600"
        self.assert_failure(self.run_check(), "newest first")

    def test_missing_and_malformed_feed(self):
        self.assert_failure(self.run_check(save=False), "rss.xml")
        self.feed.write_text("<rss><channel>")
        self.assert_failure(self.run_check(save=False), "no element found")


if __name__ == "__main__":
    unittest.main()
