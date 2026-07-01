"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  File,
  FileCode,
  FileCog,
  FileImage,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FileTreeElement = {
  id: string;
  name: string;
  /** Omit or set to "file" for a leaf node; "folder" renders a collapsible branch. */
  type?: "folder" | "file";
  children?: FileTreeElement[];
  /** Custom icon component (receives a `className` prop). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Pink-tints the item to mark it as newly added / relevant. */
  highlight?: boolean;
  /** Whether this folder starts expanded. */
  defaultOpen?: boolean;
};

// ─── Context ───────────────────────────────────────────────────────────────────

type FileTreeCtx = {
  highlightColor: string;
  indentSize: number;
  showIcons: boolean;
  defaultOpenIds: Set<string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  highlightBounds: HighlightBounds | null;
  setHighlightBounds: React.Dispatch<
    React.SetStateAction<HighlightBounds | null>
  >;
};

type HighlightBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const FileTreeContext = React.createContext<FileTreeCtx | null>(null);

function useFileTree() {
  const context = React.useContext(FileTreeContext);
  if (!context) {
    throw new Error("File tree components must be used within <FileTree />");
  }
  return context;
}

type FolderCtx = {
  isOpen: boolean;
  toggle: () => void;
};

const FolderContext = React.createContext<FolderCtx | null>(null);

function useFolder() {
  const context = React.useContext(FolderContext);
  if (!context) {
    throw new Error("Folder components must be used within a folder item");
  }
  return context;
}

// ─── Icon resolution ───────────────────────────────────────────────────────────

const EXT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tsx: FileCode,
  ts: FileCode,
  jsx: FileCode,
  js: FileCode,
  json: FileJson,
  md: FileText,
  mdx: FileText,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  svg: FileImage,
  webp: FileImage,
  config: FileCog,
  toml: FileCog,
  yaml: FileCog,
  yml: FileCog,
  env: FileCog,
};

function resolveFileIcon(
  name: string,
  custom?: React.ComponentType<{ className?: string }>
): React.ComponentType<{ className?: string }> {
  if (custom) {
    return custom;
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_ICONS[ext] ?? File;
}

// ─── Shared highlight/collapse pieces ──────────────────────────────────────────

function FileTreeHoverHighlight({ className }: { className?: string }) {
  const { highlightBounds } = useFileTree();

  return (
    <AnimatePresence>
      {highlightBounds && (
        <motion.div
          animate={{
            opacity: 1,
            top: highlightBounds.top,
            left: highlightBounds.left,
            width: highlightBounds.width,
            height: highlightBounds.height,
          }}
          className={className}
          exit={{ opacity: 0 }}
          initial={{
            opacity: 0,
            top: highlightBounds.top,
            left: highlightBounds.left,
            width: highlightBounds.width,
            height: highlightBounds.height,
          }}
          style={{ position: "absolute", pointerEvents: "none", zIndex: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
    </AnimatePresence>
  );
}

function useHighlightTarget() {
  const { containerRef, setHighlightBounds } = useFileTree();
  const ref = React.useRef<HTMLDivElement>(null);

  const onMouseEnter = React.useCallback(() => {
    const element = ref.current;
    const container = containerRef.current;
    if (!(element && container)) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    setHighlightBounds({
      top: elementRect.top - containerRect.top,
      left: elementRect.left - containerRect.left,
      width: elementRect.width,
      height: elementRect.height,
    });
  }, [containerRef, setHighlightBounds]);

  return { ref, onMouseEnter };
}

function FolderIcon({
  closeIcon,
  openIcon,
}: {
  closeIcon: React.ReactNode;
  openIcon: React.ReactNode;
}) {
  const { isOpen } = useFolder();

  return (
    <span className="relative inline-flex size-[1.125rem] shrink-0">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={{ opacity: 1 }}
          className="inline-flex"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={isOpen ? "open" : "close"}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {isOpen ? openIcon : closeIcon}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FolderContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useFolder();

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          style={{ overflow: "hidden" }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Node renderers ────────────────────────────────────────────────────────────

function FileTreeFile({ node }: { node: FileTreeElement }) {
  const { highlightColor, showIcons } = useFileTree();
  const Icon = resolveFileIcon(node.name, node.icon);
  const highlightTarget = useHighlightTarget();

  return (
    <div
      className="relative z-10"
      onMouseEnter={highlightTarget.onMouseEnter}
      ref={highlightTarget.ref}
    >
      <div
        className="pointer-events-none flex items-center gap-2 p-2"
        style={node.highlight ? { color: highlightColor } : undefined}
      >
        {showIcons && (
          <span className="inline-flex shrink-0">
            <Icon className="size-4.5" />
          </span>
        )}
        <span className="text-sm">{node.name}</span>
      </div>
    </div>
  );
}

function FileTreeFolder({ node }: { node: FileTreeElement }) {
  const { defaultOpenIds, highlightColor, indentSize, showIcons } =
    useFileTree();
  const highlightTarget = useHighlightTarget();
  const [isOpen, setIsOpen] = React.useState(
    node.defaultOpen ?? defaultOpenIds.has(node.id)
  );
  const toggle = React.useCallback(() => setIsOpen((open) => !open), []);

  return (
    <FolderContext.Provider value={{ isOpen, toggle }}>
      <div className="relative z-10" data-value={node.id}>
        <button className="w-full text-start" onClick={toggle} type="button">
          <div
            onMouseEnter={highlightTarget.onMouseEnter}
            ref={highlightTarget.ref}
          >
            <div className="pointer-events-none flex items-center gap-2 p-2">
              {showIcons && (
                <FolderIcon
                  closeIcon={<Folder className="size-4.5" />}
                  openIcon={<FolderOpen className="size-4.5" />}
                />
              )}
              <span
                className="text-sm"
                style={node.highlight ? { color: highlightColor } : undefined}
              >
                {node.name}
              </span>
            </div>
          </div>
        </button>
        <div
          className="relative ml-6 before:absolute before:inset-y-0 before:-left-2 before:h-full before:w-px before:bg-border"
          style={indentSize === 24 ? undefined : { marginLeft: indentSize }}
        >
          <FolderContent>
            {(node.children ?? []).map((child) => (
              <FileTreeNode key={child.id} node={child} />
            ))}
          </FolderContent>
        </div>
      </div>
    </FolderContext.Provider>
  );
}

function FileTreeNode({ node }: { node: FileTreeElement }) {
  if (node.type === "folder") {
    return <FileTreeFolder node={node} />;
  }
  return <FileTreeFile node={node} />;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export type FileTreeProps = {
  elements: FileTreeElement[];
  className?: string;
  /** Highlight color for items with `highlight: true`. Defaults to pink (#f472b6). */
  highlightColor?: string;
  /** Horizontal indent per nesting level in px. Defaults to 24. */
  indentSize?: number;
  /** Whether to show file/folder icons. Defaults to true. */
  showIcons?: boolean;
  /** Folder ids that should be open on first render. */
  defaultOpenIds?: string[];
};

export function FileTree({
  elements,
  className,
  highlightColor = "#f472b6",
  indentSize = 24,
  showIcons = true,
  defaultOpenIds = [],
}: FileTreeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [highlightBounds, setHighlightBounds] =
    React.useState<HighlightBounds | null>(null);
  const defaultOpenIdSet = React.useMemo(
    () => new Set(defaultOpenIds),
    [defaultOpenIds]
  );

  return (
    <FileTreeContext.Provider
      value={{
        highlightColor,
        indentSize,
        showIcons,
        defaultOpenIds: defaultOpenIdSet,
        containerRef,
        highlightBounds,
        setHighlightBounds,
      }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/60",
          className
        )}
      >
        <div
          className="relative isolate w-full p-2"
          onMouseLeave={() => setHighlightBounds(null)}
          ref={containerRef}
        >
          <FileTreeHoverHighlight className="z-0 rounded-lg border border-accent/45 bg-accent/55" />
          {elements.map((node) => (
            <FileTreeNode key={node.id} node={node} />
          ))}
        </div>
      </div>
    </FileTreeContext.Provider>
  );
}
