import Link from "next/link";
import { PrimitivesIndexNewDot } from "@/components/docs/primitives-index-new-dot";
import primitivesMeta from "@/content/docs/primitives/meta.json";
import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
} from "@/lib/docs/get-page-release-date";
import { source } from "@/lib/docs/source";

const SECTION_PATTERN = /^---(.+)---$/;

interface SectionEntry {
  releaseDate?: string;
  title: string;
  url: string;
}

interface Section {
  name: string;
  pages: SectionEntry[];
}

function getSections(): Section[] {
  const sections: Section[] = [];
  let current: Section | undefined;

  for (const entry of primitivesMeta.pages) {
    const match = entry.match(SECTION_PATTERN);
    if (match) {
      current = { name: match[1], pages: [] };
      sections.push(current);
      continue;
    }
    const page = source.getPage(["primitives", entry]);
    if (!(page && current)) {
      continue;
    }
    current.pages.push({
      title: page.data.title,
      url: page.url,
      releaseDate: getPageReleaseDateString(page.data as PageReleaseDateFields),
    });
  }

  return sections.filter((section) => section.pages.length > 0);
}

export function PrimitivesIndex() {
  return (
    <div className="flex flex-col gap-2">
      {getSections().map((section) => (
        <section key={section.name}>
          <h2>{section.name}</h2>
          <div className="not-prose grid grid-cols-2 gap-2 sm:grid-cols-3">
            {section.pages.map((page) => (
              <Link
                className="relative flex items-center justify-center rounded-lg border bg-accent/40 px-3 py-2.5 text-center font-medium text-foreground text-sm no-underline transition-colors duration-200 hover:bg-accent"
                href={page.url}
                key={page.url}
              >
                {page.title}
                <PrimitivesIndexNewDot releaseDate={page.releaseDate} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
