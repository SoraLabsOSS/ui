import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { index } from "@/__registry__";
import {
  type NewComponentEntry,
  NewComponentsSection,
} from "@/components/docs/new-components-section";
import { PrimitivesIndexNewDot } from "@/components/docs/primitives-index-new-dot";
import motionMeta from "@/content/motion/meta.json";
import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
  toReleaseDateString,
} from "@/lib/docs/get-page-release-date";
import { gitLastModifiedForFile } from "@/lib/docs/git-last-modified";
import { motionSource } from "@/lib/motion/source";

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

async function getSections(): Promise<Section[]> {
  const sections: Section[] = [];
  let current: Section | undefined;

  for (const entry of motionMeta.pages) {
    const match = entry.match(SECTION_PATTERN);
    if (match) {
      current = { name: match[1], pages: [] };
      sections.push(current);
      continue;
    }
    const page = motionSource.getPage([entry]);
    if (!(page && current)) {
      continue;
    }

    let releaseDate = getPageReleaseDateString(
      page.data as PageReleaseDateFields
    );
    if (!releaseDate) {
      const localPath = path.join(
        process.cwd(),
        "content/motion",
        `${entry}.mdx`
      );
      const filePath = fs.existsSync(localPath)
        ? localPath
        : path.join(process.cwd(), "apps/www/content/motion", `${entry}.mdx`);
      const gitDate = await gitLastModifiedForFile(filePath);
      if (gitDate) {
        releaseDate = toReleaseDateString(gitDate);
      }
    }
    if (!releaseDate) {
      releaseDate = index[entry]?.releaseDate ?? undefined;
    }

    current.pages.push({
      title: page.data.title,
      url: page.url,
      releaseDate,
    });
  }

  return sections.filter((section) => section.pages.length > 0);
}

export async function PrimitivesIndex() {
  const sections = await getSections();
  const allPages: NewComponentEntry[] = sections.flatMap(
    (section) => section.pages
  );

  return (
    <div className="flex flex-col gap-2">
      <NewComponentsSection pages={allPages} />

      {sections.map((section) => (
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
