"""Validate the published RSS feed against the built Astro article routes."""

from datetime import timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
import sys
from urllib.parse import quote
import xml.etree.ElementTree as ET

SITE = "https://rclevenger-hm.github.io/blog/"


def check_rss(dist: Path) -> int:
    posts = dist / "posts"
    expected = {
        SITE + "posts/" + quote(page.parent.relative_to(posts).as_posix()) + "/"
        for page in posts.rglob("index.html")
        if page.is_file() and page.parent != posts
    }
    if not expected:
        raise ValueError("no built article routes; run the site build first")

    root = ET.parse(dist / "rss.xml").getroot()
    if root.tag != "rss" or root.get("version") != "2.0" or len(root.findall("channel")) != 1:
        raise ValueError("expected an RSS 2.0 feed with one channel")
    channel = root.find("channel")
    errors = []

    def required(element, field, label):
        nodes = element.findall(field)
        value = (nodes[0].text or "").strip() if len(nodes) == 1 else ""
        if not value:
            errors.append(f"{label}: expected one nonempty {field}")
        return value

    for field in ("title", "description"):
        required(channel, field, "channel")
    if required(channel, "link", "channel") != SITE:
        errors.append(f"channel link must be {SITE}")

    seen = set()
    previous = None
    for index, item in enumerate(channel.findall("item"), start=1):
        label = f"item {index}"
        for field in ("title", "description"):
            required(item, field, label)
        link = required(item, "link", label)
        if link not in expected:
            errors.append(f"{label}: not a built article URL: {link}")
        if link in seen:
            errors.append(f"{label}: duplicate URL: {link}")
        seen.add(link)

        guid = item.find("guid")
        if required(item, "guid", label) != link or guid is None or guid.get("isPermaLink", "true") != "true":
            errors.append(f"{label}: GUID must equal its article permalink")

        date = required(item, "pubDate", label)
        try:
            published = parsedate_to_datetime(date)
            if published.tzinfo is None:
                raise ValueError("timezone required")
            published = published.astimezone(timezone.utc)
        except (ValueError, OverflowError):
            errors.append(f"{label}: invalid publication date: {date}")
        else:
            if previous is not None and published > previous:
                errors.append(f"{label}: items must be newest first")
            previous = published

    errors.extend(f"missing article: {link}" for link in sorted(expected - seen))
    if errors:
        raise ValueError("\n".join(errors))
    return len(expected)


if __name__ == "__main__":
    try:
        count = check_rss(Path("dist"))
    except (ValueError, ET.ParseError, OSError) as exc:
        sys.exit(f"Built RSS validation failed:\n{exc}")
    print(f"Built RSS feed covers all {count} published articles.")
