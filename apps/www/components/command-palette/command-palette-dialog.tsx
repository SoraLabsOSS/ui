"use client";

import { useSession } from "@better-auth-ui/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@workspace/ui/components/animate-ui/primitives/radix/dialog";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Box,
  CircleArrowOutUpRight,
  FileText,
  Hash,
  Monitor,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AUTH_MENU_LINKS } from "@/components/auth/auth-menu-skeletons";
import { authClient } from "@/lib/auth-client";
import type {
  CommandPaletteActionId,
  CommandPaletteActionItem,
  CommandPaletteGroup,
  CommandPaletteIcon,
} from "@/lib/command-palette/types";
import {
  getSearchResults,
  matchesCommandQuery,
  useCommandPaletteSearch,
} from "@/lib/command-palette/use-command-palette-search";
import { setThemeWithTransition } from "@/lib/theme/set-theme-with-transition";
import {
  CommandPaletteInputShortcut,
  CommandPaletteShortcut,
} from "./command-palette-shortcut";
import {
  COMMAND_LIST_HEIGHT_DURATION_MS,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command-primitives";

const THEME_ITEMS: CommandPaletteActionItem[] = [
  {
    id: "action-theme-light",
    label: "Light Mode",
    action: "theme-light",
    icon: "cog",
    searchValue: "Light Mode",
  },
  {
    id: "action-theme-dark",
    label: "Dark Mode",
    action: "theme-dark",
    icon: "cog",
    searchValue: "Dark Mode",
  },
  {
    id: "action-theme-system",
    label: "System Theme",
    action: "theme-system",
    icon: "cog",
    searchValue: "System Theme",
  },
];

const ACCOUNT_ICON_BY_TITLE: Record<
  (typeof AUTH_MENU_LINKS)[number]["title"],
  CommandPaletteIcon
> = {
  Bookmark: "bookmark",
  Settings: "settings",
};

const THEME_GROUP: CommandPaletteGroup = {
  id: "theme",
  label: "Theme",
  items: THEME_ITEMS,
};

const ACCOUNT_GROUP: CommandPaletteGroup = {
  id: "account",
  label: "Account",
  items: AUTH_MENU_LINKS.map((link) => ({
    id: `page-${link.title.toLowerCase()}`,
    label: link.title,
    href: link.url,
    icon: ACCOUNT_ICON_BY_TITLE[link.title],
    searchValue: `${link.title} Account`,
  })),
};

function CommandPaletteIconGlyph({
  icon,
  className,
}: {
  icon: CommandPaletteIcon;
  className?: string;
}) {
  const iconClassName = cn("mr-2 size-4 shrink-0", className);

  switch (icon) {
    case "book":
      return <BookOpen className={iconClassName} strokeWidth={1.5} />;
    case "bookmark":
      return <Bookmark className={iconClassName} strokeWidth={1.5} />;
    case "box":
      return <Box className={iconClassName} strokeWidth={1.5} />;
    case "external":
      return (
        <CircleArrowOutUpRight className={iconClassName} strokeWidth={1.5} />
      );
    case "settings":
      return <Settings className={iconClassName} strokeWidth={1.5} />;
    default:
      return <ArrowRight className={iconClassName} strokeWidth={1.5} />;
  }
}

function SearchResultIcon({ type }: { type: "heading" | "page" | "text" }) {
  if (type === "page") {
    return (
      <FileText
        className="size-6 shrink-0 rounded-sm border bg-muted p-0.5 text-muted-foreground shadow-sm"
        strokeWidth={1.5}
      />
    );
  }

  if (type === "heading") {
    return (
      <Hash
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
      />
    );
  }

  return null;
}

interface SearchResultItem {
  content: string;
  id: string;
  type: "heading" | "page" | "text";
  url: string;
}

function CommandSearchResultItem({
  onSelect,
  result,
}: {
  onSelect: () => void;
  result: SearchResultItem;
}) {
  const isPage = result.type === "page";
  const isNested = !isPage;

  return (
    <CommandItem
      className={cn(
        "relative gap-2",
        isNested && "ps-8 sm:ps-8",
        isPage && "font-medium",
        isNested && result.type === "text" && "text-popover-foreground/80",
        isNested && result.type === "heading" && "font-medium"
      )}
      onSelect={onSelect}
      value={result.id}
    >
      {isNested ? (
        <div
          aria-hidden
          className="absolute inset-y-0 start-[18px] w-px bg-border"
        />
      ) : null}
      <SearchResultIcon type={result.type} />
      <span className="min-w-0 flex-1 truncate">{result.content}</span>
    </CommandItem>
  );
}

function ThemeActionIcon({ action }: { action: CommandPaletteActionId }) {
  const className = "mr-2 size-4 shrink-0";

  switch (action) {
    case "theme-light":
      return <Sun className={className} strokeWidth={1.5} />;
    case "theme-dark":
      return <Moon className={className} strokeWidth={1.5} />;
    case "theme-system":
      return <Monitor className={className} strokeWidth={1.5} />;
    default:
      return null;
  }
}

function filterGroupsByQuery(
  groups: CommandPaletteGroup[],
  query: string
): CommandPaletteGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        matchesCommandQuery(item.searchValue, query)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

interface CommandPaletteDialogProps {
  groups: CommandPaletteGroup[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CommandPaletteDialog({
  open,
  onOpenChange,
  groups,
}: CommandPaletteDialogProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: session, isPending: sessionPending } = useSession(authClient);
  const { search, setSearch, query } = useCommandPaletteSearch();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setScrollLocked(false);
      return;
    }

    setScrollLocked(true);
    listRef.current?.scrollTo({ top: 0 });

    const timeout = window.setTimeout(() => {
      setScrollLocked(false);
      listRef.current?.scrollTo({ top: 0 });
    }, COMMAND_LIST_HEIGHT_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [open, setSearch]);

  const runAction = useCallback(
    (action: CommandPaletteActionId) => {
      switch (action) {
        case "theme-dark":
          setThemeWithTransition(setTheme, "dark");
          break;
        case "theme-light":
          setThemeWithTransition(setTheme, "light");
          break;
        case "theme-system":
          setThemeWithTransition(setTheme, "system");
          break;
        default:
          break;
      }
    },
    [setTheme]
  );

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const handleOpenAutoFocus = useCallback((event: Event) => {
    event.preventDefault();
    const input = (
      event.currentTarget as HTMLElement
    ).querySelector<HTMLElement>('[data-slot="command-input"]');
    input?.focus({ preventScroll: true });
  }, []);

  const handleCloseAutoFocus = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const allGroups = useMemo(() => {
    const navigationIndex = groups.findIndex(
      (group) => group.id === "navigation"
    );
    const insertAt =
      navigationIndex === -1 ? groups.length : navigationIndex + 1;

    const utilityGroups: CommandPaletteGroup[] = [
      ...(session && !sessionPending ? [ACCOUNT_GROUP] : []),
      THEME_GROUP,
    ];

    const result = [...groups];
    result.splice(insertAt, 0, ...utilityGroups);
    return result;
  }, [groups, session, sessionPending]);

  const hasQuery = search.trim().length > 0;
  const searchResults = getSearchResults(query.data);
  const filteredGroups = useMemo(
    () => (hasQuery ? filterGroupsByQuery(allGroups, search) : allGroups),
    [allGroups, hasQuery, search]
  );

  const showLoadingState =
    hasQuery &&
    query.isLoading &&
    searchResults.length === 0 &&
    filteredGroups.length === 0;

  const showEmptyState =
    hasQuery &&
    !query.isLoading &&
    searchResults.length === 0 &&
    filteredGroups.length === 0;

  const renderPaletteItem = (
    entry: CommandPaletteGroup["items"][number],
    isThemeAction: boolean
  ) => (
    <CommandItem
      key={entry.id}
      onSelect={() => {
        if (isThemeAction) {
          runAction((entry as CommandPaletteActionItem).action);
          return;
        }

        if ("href" in entry && entry.href) {
          navigate(entry.href);
        }
      }}
      value={entry.searchValue}
    >
      {isThemeAction ? (
        <ThemeActionIcon action={(entry as CommandPaletteActionItem).action} />
      ) : (
        <CommandPaletteIconGlyph icon={entry.icon} />
      )}
      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
      {"hint" in entry && entry.hint ? (
        <span className="ml-auto shrink-0 text-muted-foreground text-xs">
          {entry.hint}
        </span>
      ) : null}
      {"shortcut" in entry && entry.shortcut ? (
        <CommandPaletteShortcut keys={entry.shortcut} />
      ) : null}
    </CommandItem>
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPortal>
        <DialogOverlay
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[1000] bg-black/60"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <DialogContent
          className={cn(
            "fixed top-[max(1rem,10dvh)] right-4 left-4 z-[1001] mx-auto flex max-h-[85dvh] max-w-xl flex-col overflow-hidden rounded-2xl border bg-popover p-0 shadow-lg outline-none",
            "md:top-[max(1rem,calc(50%-220px))] md:max-h-none"
          )}
          from="left"
          onCloseAutoFocus={handleCloseAutoFocus}
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <DialogTitle className="sr-only">
            Search components, docs, blog, and actions
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search and navigate to components, documentation, blog posts, and
            quick actions.
          </DialogDescription>

          <Command className="relative min-w-0" loop shouldFilter={!hasQuery}>
            <CommandInput
              onValueChange={setSearch}
              placeholder="Search..."
              suffix={
                <span className="inline-flex items-center gap-1">
                  <CommandPaletteInputShortcut />
                  <button
                    aria-label="Close search"
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent sm:hidden"
                    onClick={() => onOpenChange(false)}
                    type="button"
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </span>
              }
              value={search}
            />

            <CommandList ref={listRef} scrollLocked={scrollLocked}>
              {showLoadingState ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Searching...
                </div>
              ) : null}

              {showEmptyState ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}

              {hasQuery && searchResults.length > 0 ? (
                <CommandGroup heading="Results">
                  {searchResults.map((result) => (
                    <CommandSearchResultItem
                      key={result.id}
                      onSelect={() => navigate(result.url)}
                      result={result}
                    />
                  ))}
                </CommandGroup>
              ) : null}

              {hasQuery &&
              searchResults.length > 0 &&
              filteredGroups.length > 0 ? (
                <CommandSeparator />
              ) : null}

              {filteredGroups.map((group, groupIndex) => (
                <Fragment key={group.id}>
                  {groupIndex > 0 ? <CommandSeparator /> : null}
                  <CommandGroup heading={group.label}>
                    {group.items.map((entry) =>
                      renderPaletteItem(entry, "action" in entry)
                    )}
                  </CommandGroup>
                </Fragment>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
