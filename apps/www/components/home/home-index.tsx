import Link from "next/link";

const GITHUB_URL = "https://github.com/axyl1410/sora";
const TWITTER_URL = "https://x.com/soralabs_io";

export function HomeIndex() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex w-full flex-1 p-6 font-mono lg:p-12">
        <div className="flex w-[24rem] flex-col gap-12 text-left">
          <div className="flex items-center gap-2 font-medium">
            <Link className="flex items-center gap-2" href="/">
              Sora UI
            </Link>
            <span>/</span>
            <a href={TWITTER_URL} rel="noreferrer" target="_blank">
              twitter
            </a>
            <span>/</span>
            <a href={GITHUB_URL} rel="noreferrer" target="_blank">
              github
            </a>
          </div>

          <div className="text-balance text-sm leading-relaxed">
            Sora UI is a motion-first React component registry built with React,
            TypeScript, Tailwind CSS, and Motion. Install animated primitives
            with the{" "}
            <a href="https://ui.shadcn.com" rel="noreferrer" target="_blank">
              shadcn/ui
            </a>{" "}
            CLI — preview in the <Link href="/docs">docs</Link> and own every
            file in your project.
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-medium text-lg">Sora UI</h2>
            <div className="text-balance font-medium text-sm">
              <Link href="/docs">
                Motion-first animated components for React. Built for the
                shadcn/ui registry.
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
