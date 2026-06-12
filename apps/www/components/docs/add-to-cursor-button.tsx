import { cn } from "@workspace/ui/lib/utils";
import { SORA_UI_CURSOR_MCP_INSTALL_LINK } from "@/lib/mcp/cursor-install";

function CursorMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
    </svg>
  );
}

export function AddToCursorButton({ className }: { className?: string }) {
  return (
    <a
      className={cn(
        "not-prose inline-flex h-9 items-center gap-2 rounded-lg bg-[#171717] px-4 font-medium text-sm text-white transition-colors hover:bg-[#262626] dark:bg-[#f5f5f5] dark:text-[#171717] dark:hover:bg-white",
        className
      )}
      href={SORA_UI_CURSOR_MCP_INSTALL_LINK}
    >
      <CursorMark />
      Add to Cursor
    </a>
  );
}
