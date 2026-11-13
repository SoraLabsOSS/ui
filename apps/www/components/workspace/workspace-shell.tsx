"use client";

import { useAuth, useSession } from "@workspace/auth-ui/lib/auth-react";
import { SoraIcon } from "@workspace/ui/components/icons/sora-icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/ui/avatar";
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
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { MouseEvent, ReactNode } from "react";

import { usePageTransition } from "@/components/page-transition/page-transition-provider";
import { isAuthEnabled } from "@/env";

function WorkspaceSidebar() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const closeMobile = useCallback(() => setOpenMobile(false), [setOpenMobile]);
  const pathname = usePathname();
  const handleHomeClick = useWorkspaceHomeClick();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border mx-2 border-b px-0 pt-3 pb-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <div className="group/logo relative flex items-center justify-center">
              <SidebarMenuButton
                className="size-8 items-center justify-center !px-0 group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                render={<Link href="/" onClick={handleHomeClick} />}
                tooltip="Sora UI"
              >
                <SoraIcon className="size-5!" />
              </SidebarMenuButton>
              <SidebarMenuButton
                className="pointer-events-none absolute inset-0 size-8 items-center justify-center opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                onClick={toggleSidebar}
                tooltip="Open sidebar"
              >
                <PanelLeftIcon className="size-5!" />
              </SidebarMenuButton>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors duration-150 [&_svg]:size-5!" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-8 rounded-lg transition-colors duration-150"
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

      <SidebarFooter className="border-sidebar-border mx-2 gap-1 border-t px-0 pt-3 pb-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem className="mb-1">
            <SidebarMenuButton
              className="h-8 rounded-lg transition-colors duration-150"
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
              className="h-8 rounded-lg transition-colors duration-150"
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
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 360;
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
  const avatarStyle = {
    background: `linear-gradient(135deg, oklch(0.35 0.08 ${hue}), oklch(0.25 0.05 ${hue + 40}))`,
  };
  const authLabel = session
    ? localization.auth.signOut
    : localization.auth.signIn;
  const authPath = `${basePaths.auth}/${session ? viewPaths.auth.signOut : viewPaths.auth.signIn}`;
  let avatar: ReactNode;

  if (session?.user.image) {
    avatar = (
      <Avatar className="ring-sidebar-border/50 size-5 ring-1">
        <AvatarImage
          alt={session.user.name || userEmail}
          className="object-cover"
          src={session.user.image}
        />
        <AvatarFallback style={avatarStyle} />
      </Avatar>
    );
  } else if (session) {
    avatar = (
      <div
        aria-hidden="true"
        className="ring-sidebar-border/50 size-5 shrink-0 rounded-full ring-1"
        style={avatarStyle}
      />
    );
  } else {
    avatar = (
      <div className="bg-sidebar-foreground/10 flex size-5 shrink-0 items-center justify-center rounded-full">
        <User2 className="size-3.5" />
      </div>
    );
  }

  return (
    <SidebarMenuItem className="border-sidebar-border mt-2 border-t pt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-8 rounded-lg bg-transparent px-2 transition-colors duration-150 group-data-[collapsible=icon]:justify-center"
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
                {avatar}
                <span
                  className="truncate group-data-[collapsible=icon]:hidden"
                  data-testid="user-email"
                >
                  {session ? userEmail : localization.auth.signIn}
                </span>
                <ChevronUp className="text-sidebar-foreground/50 ml-auto size-3.5 shrink-0 group-data-[collapsible=icon]:hidden" />
              </>
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="border-border/60 bg-card/95 w-(--radix-popper-anchor-width) rounded-lg border shadow-[var(--shadow-float)] backdrop-blur-xl"
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
      className="bg-sidebar h-dvh min-h-0 overflow-hidden"
      defaultOpen={defaultOpen}
    >
      <WorkspaceSidebar />
      <SidebarInset className="bg-sidebar h-dvh min-h-0 overflow-hidden">
        <div className="bg-background md:border-border/40 relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:rounded-tl-[12px] md:border-t md:border-l">
          <WorkspaceMobileHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function WorkspaceMobileHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 md:hidden">
      <SidebarTrigger className="text-muted-foreground -ms-2 [&_svg]:size-5!" />
      <span className="text-base font-medium">My Library</span>
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
