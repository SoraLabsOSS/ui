"use client";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@workspace/ui/components/ui/input-group";
import { TextShimmer } from "@workspace/ui/components/ui/text-shimmer";
import { cn } from "@workspace/ui/lib/utils";
import { DefaultChatTransport, type SourceUrlUIPart, type UIMessage } from "ai";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  ChevronDown,
  FileText,
  Loader,
  MessageCircleIcon,
  RefreshCw,
  SearchIcon,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { plainSourceTitle } from "@/lib/plain-text";
import { Markdown } from "../markdown";

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

const HIDE_ASK_AI_PREFIXES = ["/auth"] as const;

export function isAskAiPath(pathname: string) {
  if (pathname === "/") {
    return false;
  }

  return !HIDE_ASK_AI_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const LOADING_MESSAGES = [
  "Searching...",
  "Digging through results...",
  "Scanning the knowledge base...",
  "Finding the best matches...",
  "Sifting through the data...",
  "Almost there...",
  "Looking far and wide...",
  "Connecting the dots...",
  "Rummaging through pages...",
  "Hunting down answers...",
] as const;

const LOADING_MESSAGE_INTERVAL_MS = 2500;

const SUGGESTED_PROMPTS = [
  "How do I install Sora UI?",
  "What is stagger button?",
  "How do I add icons?",
] as const;

const PENDING_ASSISTANT: ChatUIMessage = {
  id: "pending-assistant",
  role: "assistant",
  parts: [],
};

const TOOL_CALL_XML = /<tool_call>[\s\S]*?<\/tool_call>/gi;

const roleName: Record<string, string> = {
  user: "you",
  assistant: "Sora AI",
};

function stripLeakedToolCall(text: string) {
  TOOL_CALL_XML.lastIndex = 0;
  return text.replace(TOOL_CALL_XML, "").trim();
}

function isBusyStatus(status: UseChatHelpers<ChatUIMessage>["status"]) {
  return status === "streaming" || status === "submitted";
}

function messageContent(message: ChatUIMessage) {
  let markdown = "";
  const sources: SourceUrlUIPart[] = [];
  const seen = new Set<string>();

  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      markdown += part.text;
      continue;
    }

    if (part.type !== "source-url" || seen.has(part.url)) {
      continue;
    }

    seen.add(part.url);
    sources.push(part);
  }

  return { markdown: stripLeakedToolCall(markdown), sources };
}

function sourceTitle(source: SourceUrlUIPart) {
  if (source.title?.trim()) {
    return plainSourceTitle(source.title);
  }

  try {
    const path = new URL(source.url, "https://ui.soralabs.studio").pathname;
    const last = path.split("/").filter(Boolean).at(-1) ?? path;
    return last.replaceAll("-", " ");
  } catch {
    return source.url;
  }
}

function sendUserText(
  sendMessage: UseChatHelpers<ChatUIMessage>["sendMessage"],
  text: string
) {
  return sendMessage({
    role: "user",
    parts: [
      {
        type: "data-client",
        data: {
          location: location.href,
        },
      },
      {
        type: "text",
        text,
      },
    ],
  });
}

function inputPlaceholder(status: UseChatHelpers<ChatUIMessage>["status"]) {
  if (status === "submitted") {
    return "Searching docs...";
  }

  if (status === "streaming") {
    return "AI is answering...";
  }

  return "Ask a question";
}

function useRotatingLoadingMessage(active: boolean) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }

    setIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));

    if (reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, LOADING_MESSAGE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [active, reduceMotion]);

  return LOADING_MESSAGES[index] ?? LOADING_MESSAGES[0];
}

function StreamingDots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-0.5">
      <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:0ms] motion-reduce:animate-none" />
      <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:150ms] motion-reduce:animate-none" />
      <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:300ms] motion-reduce:animate-none" />
    </span>
  );
}

function SearchSources({ sources }: { sources: SourceUrlUIPart[] }) {
  const reduceMotion = useReducedMotion();

  if (sources.length === 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="mt-3 min-w-0"
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
    >
      <p className="mb-1.5 font-medium text-fd-muted-foreground text-xs">
        {sources.length === 1 ? "1 source" : `${sources.length} sources`}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {sources.map((source) => {
          const title = sourceTitle(source);

          return (
            <li className="min-w-0 max-w-full" key={source.sourceId}>
              <Link
                className="flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden rounded-full border bg-fd-secondary px-2 py-0.5 text-fd-secondary-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                href={source.url}
                title={title}
              >
                <FileText className="size-3 shrink-0" />
                <span className="truncate">{title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function StreamingStatus() {
  const label = useRotatingLoadingMessage(true);
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-live="polite"
      className="mt-2 flex items-center gap-2 text-fd-muted-foreground text-xs"
      role="status"
    >
      <SearchIcon className="size-3.5 shrink-0" />
      {reduceMotion ? (
        <span>{label}</span>
      ) : (
        <TextShimmer as="span" className="text-xs" duration={1.5}>
          {label}
        </TextShimmer>
      )}
    </div>
  );
}

function chatStatusCopy(
  status: UseChatHelpers<ChatUIMessage>["status"],
  hasText: boolean
) {
  if (status === "error") {
    return "Something went wrong. Try again.";
  }

  if (status === "submitted" || (status === "streaming" && !hasText)) {
    return "Searching the docs…";
  }

  if (status === "streaming") {
    return "Writing an answer…";
  }

  return "AI can be inaccurate, please verify the answers.";
}

export function AISearchPanelHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  const { setOpen } = useAISearchContext();
  const { status, messages } = useChatContext();
  const last = messages.at(-1);
  const hasText =
    last?.role === "assistant" ? Boolean(messageContent(last).markdown) : false;
  const busy = isBusyStatus(status);

  return (
    <div
      className={cn(
        "sticky top-0 flex items-start gap-2 rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex-1 px-3 py-2">
        <p className="mb-2 flex items-center gap-2 font-medium text-sm">
          AI Chat
          {busy ? (
            <span className="inline-flex items-center gap-1.5 font-normal text-fd-muted-foreground text-xs">
              <span className="size-1.5 animate-pulse rounded-full bg-fd-primary motion-reduce:animate-none" />
              {status === "submitted" || !hasText ? "Searching" : "Answering"}
            </span>
          ) : null}
        </p>
        <p aria-live="polite" className="text-fd-muted-foreground text-xs">
          {chatStatusCopy(status, hasText)}
        </p>
      </div>

      <button
        aria-label="Close"
        className={cn(
          buttonVariants({
            size: "icon-sm",
            color: "ghost",
            className: "rounded-full text-fd-muted-foreground",
          })
        )}
        onClick={() => setOpen(false)}
        tabIndex={-1}
        type="button"
      >
        <X />
      </button>
    </div>
  );
}

const StorageKeyInput = "__ai_search_input";

export function AISearchInput(props: ComponentProps<"form">) {
  const {
    messages: allMessages,
    status,
    sendMessage,
    stop,
    setMessages,
    regenerate,
  } = useChatContext();
  const messages = allMessages.filter((msg) => msg.role !== "system");
  const [input, setInput] = useState(
    () => localStorage.getItem(StorageKeyInput) ?? ""
  );
  const isLoading = isBusyStatus(status);
  const hasMessages = messages.length > 0;
  const canRetry =
    !isLoading && messages.at(-1)?.role === "assistant" && hasMessages;

  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) {
      return;
    }

    sendUserText(sendMessage, message);
    setInput("");
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) {
      document.getElementById("nd-ai-input")?.focus();
    }
  }, [isLoading]);

  const isEmpty = input.trim().length === 0;

  return (
    <form
      {...props}
      className={cn("shrink-0", props.className)}
      onSubmit={onStart}
    >
      <InputGroup
        className={cn(
          "min-h-11 rounded-2xl border-fd-border/80 bg-fd-background/80 shadow-xs backdrop-blur-xl supports-backdrop-filter:bg-fd-background/55",
          "has-[>textarea]:h-auto",
          "has-disabled:!bg-fd-background/80 supports-backdrop-filter:has-disabled:!bg-fd-background/55 has-disabled:opacity-100",
          "has-[[data-slot=input-group-control]:focus-visible]:!ring-1 has-[[data-slot=input-group-control]:focus-visible]:border-fd-ring has-[[data-slot=input-group-control]:focus-visible]:ring-fd-ring/50",
          "dark:!bg-fd-background/80 dark:has-disabled:!bg-fd-background/80 supports-backdrop-filter:dark:!bg-fd-background/55"
        )}
      >
        <InputGroupTextarea
          autoFocus
          className="max-h-32 min-h-11 min-w-0 px-3 py-3 text-sm placeholder:text-fd-muted-foreground focus-visible:ring-0 disabled:opacity-60"
          disabled={isLoading}
          id="nd-ai-input"
          onChange={(e) => {
            setInput(e.target.value);
            localStorage.setItem(StorageKeyInput, e.target.value);
          }}
          onKeyDown={(event) => {
            if (!event.shiftKey && event.key === "Enter") {
              onStart(event);
            }
          }}
          placeholder={inputPlaceholder(status)}
          rows={1}
          value={input}
        />
        <InputGroupAddon
          align="block-end"
          className="!opacity-100 justify-between px-3 pb-3"
        >
          <div className="flex items-center gap-1">
            {hasMessages ? (
              <>
                <InputGroupButton
                  aria-label="Clear chat"
                  className="rounded-full"
                  disabled={isLoading}
                  onClick={() => setMessages([])}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="size-4" />
                </InputGroupButton>
                {canRetry ? (
                  <InputGroupButton
                    aria-label="Retry last answer"
                    className="rounded-full"
                    onClick={() => regenerate()}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <RefreshCw className="size-4" />
                  </InputGroupButton>
                ) : null}
              </>
            ) : null}
          </div>
          {isLoading ? (
            <InputGroupButton
              aria-label="Stop generating"
              className="rounded-full"
              onClick={stop}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <Loader className="size-4 animate-spin" />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              aria-disabled={isEmpty}
              aria-label="Send message"
              className={cn(
                "rounded-lg shadow-none",
                isEmpty &&
                  "pointer-events-none border-fd-border text-fd-foreground opacity-70"
              )}
              size="icon-sm"
              type="submit"
              variant={isEmpty ? "outline" : "default"}
            >
              <Send className="size-4" />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

const BOTTOM_FOLLOW_THRESHOLD_PX = 64;

function ScrollToBottomButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
      <button
        aria-label="Scroll to bottom"
        className={cn(
          "pointer-events-auto inline-flex size-8 items-center justify-center rounded-full border border-fd-border bg-fd-background text-fd-foreground shadow-md",
          "hover:bg-fd-muted",
          reduceMotion
            ? active
              ? "opacity-100"
              : "pointer-events-none opacity-0"
            : [
                "transition-[translate,scale,opacity] duration-200",
                "data-[active=false]:pointer-events-none data-[active=false]:translate-y-full data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)]",
                "data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)]",
              ]
        )}
        data-active={active ? "true" : "false"}
        inert={active ? undefined : true}
        onClick={onClick}
        tabIndex={active ? 0 : -1}
        type="button"
      >
        <ChevronDown className="size-4 shrink-0" />
      </button>
    </div>
  );
}

function List({
  scrollToken,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "dir"> & { scrollToken?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const updateScrollPosition = useEffectEvent(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distance > BOTTOM_FOLLOW_THRESHOLD_PX);
  });

  const scrollToBottom = useEffectEvent(
    (behavior: ScrollBehavior = "instant") => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }
  );

  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!(content && container)) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distance < BOTTOM_FOLLOW_THRESHOLD_PX) {
        scrollToBottom();
      }
      updateScrollPosition();
    });
    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollToken == null) {
      return;
    }

    scrollToBottom();
    const id = requestAnimationFrame(() => {
      scrollToBottom();
      updateScrollPosition();
    });
    return () => cancelAnimationFrame(id);
  }, [scrollToken]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        {...props}
        className={cn(
          "fd-scroll-container flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto py-0!",
          className
        )}
        onScroll={updateScrollPosition}
      >
        <div className="flex min-h-full flex-col" ref={contentRef}>
          {children}
        </div>
      </div>
      <ScrollToBottomButton
        active={showScrollButton}
        onClick={() => scrollToBottom("smooth")}
      />
    </div>
  );
}

function userMessageText(message: ChatUIMessage) {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

function UserMessage({
  message,
  ...props
}: { message: ChatUIMessage } & ComponentProps<"div">) {
  const text = userMessageText(message);

  if (!text) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Clicks stop at the bubble so the panel overlay does not steal them.
    // biome-ignore lint/a11y/noStaticElementInteractions: Same as above — the wrapper is not a control.
    // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; no action to keyboard-map.
    <div
      className="flex justify-end"
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <div className="max-w-[85%] rounded-3xl bg-fd-secondary px-4 py-2.5 text-fd-secondary-foreground text-sm">
        <p className="whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  );
}

function AssistantMessage({
  isStreaming = false,
  message,
  className,
  ...props
}: {
  isStreaming?: boolean;
  message: ChatUIMessage;
} & ComponentProps<"div">) {
  const { markdown, sources } = messageContent(message);
  const waitingForText = isStreaming && !markdown;

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Clicks stop at the bubble so the panel overlay does not steal them.
    // biome-ignore lint/a11y/noStaticElementInteractions: Same as above — the wrapper is not a control.
    // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; no action to keyboard-map.
    <div
      className={cn("min-w-0", className)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <p className="mb-1 font-medium text-fd-primary text-sm">
        {roleName[message.role] ?? "unknown"}
      </p>
      {markdown ? (
        <div className="prose text-sm">
          <Markdown text={markdown} />
          {isStreaming ? (
            <span className="ms-1 inline-flex align-middle text-fd-muted-foreground">
              <StreamingDots />
            </span>
          ) : null}
        </div>
      ) : null}

      {isStreaming ? null : <SearchSources sources={sources} />}

      {waitingForText ? <StreamingStatus /> : null}
    </div>
  );
}

function EmptyState() {
  const { sendMessage, status } = useChatContext();
  const disabled = isBusyStatus(status);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 px-4 text-center text-fd-muted-foreground/80 text-sm">
      <MessageCircleIcon fill="currentColor" stroke="none" />
      <div className="space-y-1">
        <p className="font-medium text-fd-foreground">Start a conversation</p>
        <p>Ask about a primitive, install steps, or how something animates.</p>
      </div>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              className={cn(
                buttonVariants({
                  color: "secondary",
                  size: "sm",
                  className: "rounded-full",
                })
              )}
              disabled={disabled}
              onClick={() => {
                sendUserText(sendMessage, prompt);
              }}
              type="button"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: "search",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>
      {children}
    </Context>
  );
}

export function AISearchTrigger({
  position = "default",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { position?: "default" | "float" }) {
  const { open, setOpen } = useAISearchContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const button = (
    <button
      {...props}
      className={cn(
        position === "float" && [
          // Above the fixed full-height TOC (#nd-toc is z-20).
          "fixed inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] bottom-4 z-40 w-24 cursor-pointer gap-3 shadow-lg transition-[translate,opacity]",
          open && "pointer-events-none translate-y-10 opacity-0",
        ],
        className
      )}
      data-state={open ? "open" : "closed"}
      onClick={() => setOpen(!open)}
      type="button"
    >
      {children}
    </button>
  );

  if (position === "float") {
    return mounted ? createPortal(button, document.body) : null;
  }

  return button;
}

const PANEL_MS = 220;

function getPanelDuration() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return PANEL_MS;
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [entered, setEntered] = useState(false);
  useHotKey();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }

    setEntered(false);
    const id = window.setTimeout(() => setRendered(false), getPanelDuration());
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!(rendered && open)) {
      return;
    }

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setEntered(true);
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, rendered]);

  if (!(mounted && rendered)) {
    return null;
  }

  return createPortal(
    <>
      <button
        aria-label="Close AI chat"
        className={cn(
          "fixed inset-0 z-40 cursor-default border-0 bg-fd-overlay/60 backdrop-blur-xs lg:hidden",
          "transition-opacity duration-200 motion-reduce:transition-none",
          entered ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setOpen(false)}
        type="button"
      />
      <aside
        aria-label="AI Chat"
        aria-modal="true"
        className={cn(
          "fixed z-40 flex w-[min(100vw-1rem,var(--ai-chat-width))] flex-col overflow-hidden bg-fd-card text-fd-card-foreground shadow-xl",
          "inset-e-2 top-4 bottom-4 rounded-2xl border",
          "lg:inset-e-0 lg:top-[calc(var(--fd-banner-height)+var(--fd-nav-height))] lg:bottom-0 lg:w-(--ai-chat-width) lg:rounded-none lg:border-s lg:border-e-0 lg:shadow-none",
          "[--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]",
          "transition-transform duration-200 ease-out will-change-transform motion-reduce:translate-x-0 motion-reduce:transition-none",
          entered ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
      >
        <div className="flex size-full min-h-0 flex-col gap-3 p-2 lg:p-3">
          <AISearchPanelHeader />
          <AISearchPanelList className="min-h-0 flex-1" />
          <AISearchInput />
        </div>
      </aside>
    </>,
    document.body
  );
}

export function AISearchPanelList({
  className,
  style,
  ...props
}: ComponentProps<"div">) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== "system");
  const last = messages.at(-1);
  const showPending = isBusyStatus(chat.status) && last?.role === "user";

  return (
    <List
      aria-busy={isBusyStatus(chat.status)}
      className={cn("overscroll-contain py-4", className)}
      scrollToken={`${messages.length}:${last?.id ?? ""}:${showPending ? "1" : "0"}`}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, white 1rem, white 100%)",
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex min-w-0 flex-col gap-4 px-3 py-4">
          {chat.error && (
            <div className="rounded-lg border bg-fd-secondary p-2 text-fd-secondary-foreground">
              <p className="mb-1 text-fd-muted-foreground text-xs">
                Request Failed: {chat.error.name}
              </p>
              <p className="text-sm">{chat.error.message}</p>
            </div>
          )}
          {messages.map((item) =>
            item.role === "user" ? (
              <UserMessage key={item.id} message={item} />
            ) : (
              <AssistantMessage
                isStreaming={
                  isBusyStatus(chat.status) &&
                  item.role === "assistant" &&
                  item.id === last?.id
                }
                key={item.id}
                message={item}
              />
            )
          )}
          {showPending ? (
            <AssistantMessage isStreaming message={PENDING_ASSISTANT} />
          ) : null}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();
  const pathname = usePathname();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (
      e.key === "/" &&
      (e.metaKey || e.ctrlKey) &&
      !open &&
      isAskAiPath(pathname)
    ) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);
}

export function useAISearchContext() {
  const value = use(Context);
  if (!value) {
    throw new Error("AISearch context is missing");
  }
  return value;
}

function useChatContext() {
  return useAISearchContext().chat;
}
