import { icons } from "lucide-react";
import Link from "next/link";
import { PrimitivesIndexNewDot } from "@/components/docs/primitives-index-new-dot";
import uiMeta from "@/content/ui/meta.json";
import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
} from "@/lib/docs/get-page-release-date";
import { uiSource } from "@/lib/ui/source";

const SECTION_PATTERN = /^---(.+)---$/;

interface SectionEntry {
  icon?: string;
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

  for (const entry of uiMeta.pages as string[]) {
    const match = entry.match(SECTION_PATTERN);
    if (match) {
      current = { name: match[1], pages: [] };
      sections.push(current);
      continue;
    }
    const page = uiSource.getPage([entry]);
    if (!(page && current)) {
      continue;
    }
    current.pages.push({
      title: page.data.title,
      url: page.url,
      icon: page.data.icon,
      releaseDate: getPageReleaseDateString(page.data as PageReleaseDateFields),
    });
  }

  return sections.filter((section) => section.pages.length > 0);
}

export function UiIndex() {
  const sections = getSections();

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => (
        <section key={section.name}>
          <h2>{section.name}</h2>
          <div className="not-prose grid grid-cols-2 gap-2 sm:grid-cols-3">
            {section.pages.map((page) => {
              const Icon =
                page.icon && page.icon in icons
                  ? icons[page.icon as keyof typeof icons]
                  : null;

              return (
                <Link
                  className="relative flex items-center justify-center rounded-lg border bg-accent/40 px-3 py-2.5 text-center font-medium text-foreground text-sm no-underline transition-colors duration-200 hover:bg-accent"
                  href={page.url}
                  key={page.url}
                >
                  {Icon && <Icon className="mr-2 size-4 shrink-0 opacity-70" />}
                  {page.title}
                  <PrimitivesIndexNewDot releaseDate={page.releaseDate} />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
