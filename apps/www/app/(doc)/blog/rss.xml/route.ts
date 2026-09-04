import { Feed } from "feed";
import { NextResponse } from "next/server";
import { blog } from "@/lib/blog/source";
import { SITE_URL } from "@/lib/site";

export function GET() {
  const feed = new Feed({
    title: "Sora UI Blog",
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    language: "en",
    image: `${SITE_URL}/android-chrome-512x512.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} Sora UI`,
  });

  for (const page of blog
    .getPages()
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )) {
    if (page.data.hidden || page.data.subpage) {
      continue;
    }

    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${SITE_URL}${page.url}`,
      date: new Date(page.data.date),
      author: [
        {
          name: page.data.author,
        },
      ],
    });
  }

  return new NextResponse(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
