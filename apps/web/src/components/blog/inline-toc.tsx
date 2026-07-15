import type { TocEntry } from "@/lib/blog";

export function InlineToc({ items }: { items: TocEntry[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="not-prose mb-8 rounded-lg border border-[#1a1a1a]" open>
      <summary className="cursor-pointer px-4 py-3 text-[#999] text-[11px] uppercase tracking-[0.08em]">
        On this page
      </summary>
      <ul className="flex flex-col gap-2 border-[#1a1a1a] border-t px-4 py-3">
        {items.map((item) => (
          <li className={item.depth === 3 ? "pl-4" : undefined} key={item.id}>
            <a
              className="text-[#999] text-[13px] no-underline hover:text-white"
              href={`#${item.id}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
