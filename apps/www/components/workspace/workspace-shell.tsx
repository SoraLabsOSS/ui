"use client";

import { useAuth, useSession } from "@workspace/auth-ui/lib/auth-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/ui/base-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import {
  Bookmark,
  BookOpen,
  ChevronUp,
  Loader2,
  LogIn,
  LogOut,
  PanelLeftIcon,
  Settings,
  User2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { type MouseEvent, type ReactNode, useCallback } from "react";
import { IconLogo } from "@/components/icon-logo";
import { usePageTransition } from "@/components/page-transition/page-transition-provider";
import { isAuthEnabled } from "@/env";

function WorkspaceSidebar() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const closeMobile = useCallback(() => setOpenMobile(false), [setOpenMobile]);
  const pathname = usePathname();
  const handleHomeClick = useWorkspaceHomeClick();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-3 pb-0">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <div className="group/logo relative flex items-center justify-center">
              <SidebarMenuButton
                className="!px-0 size-8 items-center justify-center group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                render={<Link href="/" onClick={handleHomeClick} />}
                tooltip="Sora UI"
              >
                <IconLogo className="size-4" />
              </SidebarMenuButton>
              <SidebarMenuButton
                className="pointer-events-none absolute inset-0 size-8 opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                onClick={toggleSidebar}
                tooltip="Open sidebar"
              >
                <PanelLeftIcon className="size-4" />
              </SidebarMenuButton>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarTrigger className="text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-8 rounded-lg text-[13px] transition-colors duration-150"
                  isActive={pathname === "/library"}
                  render={<Link href="/library" onClick={closeMobile} />}
                  tooltip="My Library"
                >
                  <Bookmark className="size-4" />
                  <span className="font-medium">My Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-1 border-sidebar-border border-t py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-8 rounded-lg text-[13px] transition-colors duration-150"
              isActive={pathname.startsWith("/settings/")}
              render={<Link href="/settings/account" onClick={closeMobile} />}
              tooltip="Settings"
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-8 rounded-lg text-[13px] transition-colors duration-150"
              render={<Link href="/docs" onClick={closeMobile} />}
              tooltip="Back to docs"
            >
              <BookOpen className="size-4" />
              <span>Back to docs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isAuthEnabled() && <WorkspaceUserNav />}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
}

function WorkspaceUserNav() {
  const {
    authClient,
    basePaths,
    localization,
    viewPaths,
    Link: AuthLink,
  } = useAuth();
  const { data: session, isPending } = useSession(authClient);
  const { resolvedTheme, setTheme } = useTheme();
  const userEmail = session?.user.email ?? "";
  const hue = emailToHue(userEmail);
  const authLabel = session
    ? localization.auth.signOut
    : localization.auth.signIn;
  const authPath = `${basePaths.auth}/${session ? viewPaths.auth.signOut : viewPaths.auth.signIn}`;

  return (
    <SidebarMenuItem className="mt-2 border-sidebar-border border-t pt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className="h-8 rounded-lg bg-transparent px-2 text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            data-testid="user-nav-button"
          >
            {isPending ? (
              <>
                <Skeleton className="size-5 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-28 group-data-[collapsible=icon]:hidden" />
                <Loader2 className="ml-auto size-3.5 animate-spin group-data-[collapsible=icon]:hidden" />
              </>
            ) : (
              <>
                {session ? (
                  <div
                    className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.35 0.08 ${hue}), oklch(0.25 0.05 ${hue + 40}))`,
                    }}
                  />
                ) : (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sidebar-foreground/10">
                    <User2 className="size-3.5" />
                  </div>
                )}
                <span
                  className="truncate text-[13px] group-data-[collapsible=icon]:hidden"
                  data-testid="user-email"
                >
                  {session ? userEmail : localization.auth.signIn}
                </span>
                <ChevronUp className="ml-auto size-3.5 shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
              </>
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--radix-popper-anchor-width) rounded-lg border border-border/60 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-xl"
          data-testid="user-nav-menu"
          side="top"
        >
          <DropdownMenuItem
            className="cursor-pointer text-[13px]"
            data-testid="user-nav-item-theme"
            onSelect={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild data-testid="user-nav-item-auth">
            <AuthLink href={authPath}>
              {session ? (
                <LogOut className="text-muted-foreground" />
              ) : (
                <LogIn className="text-muted-foreground" />
              )}
              {authLabel}
            </AuthLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

export function WorkspaceShell({
  children,
  defaultOpen,
}: {
  children: ReactNode;
  defaultOpen: boolean;
}) {
  return (
    <SidebarProvider
      className="h-dvh min-h-0 overflow-hidden bg-sidebar"
      defaultOpen={defaultOpen}
    >
      <WorkspaceSidebar />
      <SidebarInset className="h-dvh min-h-0 overflow-hidden bg-sidebar">
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background md:rounded-tl-[12px] md:border-border/40 md:border-t md:border-l">
          <WorkspaceMobileHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function WorkspaceMobileHeader() {
  const handleHomeClick = useWorkspaceHomeClick();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 md:hidden">
      <SidebarTrigger className="-ms-2 text-muted-foreground" />
      <Link
        className="inline-flex items-center gap-2"
        href="/"
        onClick={handleHomeClick}
      >
        <IconLogo className="size-4" />
        <span className="font-medium text-sm">My Library</span>
      </Link>
    </header>
  );
}

function useWorkspaceHomeClick() {
  const { setOpenMobile } = useSidebar();
  const { transitionTo } = usePageTransition();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      setOpenMobile(false);
      transitionTo("/", "commercial");
    },
    [setOpenMobile, transitionTo]
  );
}
