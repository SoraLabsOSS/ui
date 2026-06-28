"use client";

import { useSession } from "@better-auth-ui/react";
import { useEffect, useRef } from "react";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

const CHAT_PLACEHOLDER = "Ask anything about Sora UI…";
const COMPACT_STYLE_ID = "sora-docs-chat-compact";
const DISCLAIMER_ID = "sora-docs-chat-disclaimer";

const CHAT_DISCLAIMER =
  "Answers are generated from Sora UI documentation. May be inaccurate.";

/** Shorter labels — header + a11y (via snippet `translations` JSON). */
const CHAT_TRANSLATIONS = JSON.stringify({
  chatTitle: "Ask AI",
  openChatAriaLabel: "Open Sora UI docs assistant",
  chatEmptyTitle: "Ask anything about Sora UI",
  chatEmptyDescription:
    "Search documentation, components, and installation guides.",
});

/**
 * Snippet hardcodes 380×58px for the minimized bar — not exposed as CSS vars.
 * Shadow root is open, so we inject compact overrides after each internal render.
 */
const COMPACT_CHAT_SHADOW_CSS = `
  .chat-header-actions .minimize-button {
    display: none;
  }

  .chat-window.minimized {
    width: 250px;
    height: 46px;
  }

  .chat-window.minimized .chat-header {
    padding: 7px 10px;
    border-bottom: none;
  }

  .chat-window.minimized .chat-header-title {
    font-size: 14px;
    gap: 7px;
  }

  .chat-window.minimized .chat-header-title svg {
    width: 16px;
    height: 16px;
  }

  .chat-window.minimized .icon-button {
    width: 28px;
    height: 28px;
  }

  .chat-window.minimized .icon-button svg {
    width: 15px;
    height: 15px;
  }

  .sora-chat-disclaimer {
    flex-shrink: 0;
    margin: 0;
    padding: 6px 12px 10px;
    border-top: 1px solid var(--search-snippet-border-color);
    color: var(--search-snippet-text-secondary);
    font-size: 11px;
    line-height: 1.35;
    text-align: center;
  }

  .chat-window.minimized .sora-chat-disclaimer {
    display: none;
  }
`;

function injectCompactChatStyles(chatBubble: HTMLElement): void {
  const root = chatBubble.shadowRoot;
  if (!root || root.getElementById(COMPACT_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = COMPACT_STYLE_ID;
  style.textContent = COMPACT_CHAT_SHADOW_CSS;
  root.appendChild(style);
}

/** Snippet has no disclaimer API — inject at the bottom of the chat panel. */
function injectChatDisclaimer(chatBubble: HTMLElement): void {
  const root = chatBubble.shadowRoot;
  if (!root) {
    return;
  }

  const chatWindow = root.querySelector(".chat-window");
  if (!chatWindow || root.getElementById(DISCLAIMER_ID)) {
    return;
  }

  const disclaimer = document.createElement("p");
  disclaimer.id = DISCLAIMER_ID;
  disclaimer.className = "sora-chat-disclaimer";
  disclaimer.textContent = CHAT_DISCLAIMER;
  chatWindow.appendChild(disclaimer);
}

function injectChatOverrides(chatBubble: HTMLElement): void {
  injectCompactChatStyles(chatBubble);
  injectChatDisclaimer(chatBubble);
}

function watchChatOverrides(chatBubble: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => {
    injectChatOverrides(chatBubble);
  });

  if (chatBubble.shadowRoot) {
    injectChatOverrides(chatBubble);
    observer.observe(chatBubble.shadowRoot, { childList: true, subtree: true });
  }

  return observer;
}

/**
 * Cloudflare AI Search floating chat (RAG over docs).
 * Experimental — authenticated users only.
 * Requires `NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_API_URL` — see `.env.example`.
 */
export function DocsAiSearchChatBubble() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending: sessionPending } = useSession(authClient);
  const apiUrl = env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_API_URL;
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    const url = env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_API_URL;
    if (!(url && hostRef.current && isAuthenticated)) {
      return;
    }

    let chatBubble: HTMLElement | null = null;
    let styleObserver: MutationObserver | null = null;
    let cancelled = false;

    import("@cloudflare/ai-search-snippet")
      .then(() => {
        if (cancelled || !hostRef.current) {
          return;
        }

        chatBubble = document.createElement("chat-bubble-snippet");
        chatBubble.className = "docs-ai-search-chat";
        chatBubble.setAttribute("api-url", url);
        chatBubble.setAttribute("placeholder", CHAT_PLACEHOLDER);
        chatBubble.setAttribute("theme", "auto");
        chatBubble.setAttribute("hide-branding", "true");
        chatBubble.setAttribute("translations", CHAT_TRANSLATIONS);
        hostRef.current.appendChild(chatBubble);

        const attachOverrides = () => {
          if (!chatBubble?.shadowRoot) {
            return;
          }
          styleObserver?.disconnect();
          styleObserver = watchChatOverrides(chatBubble);
        };

        chatBubble.addEventListener("ready", attachOverrides);
        attachOverrides();
      })
      .catch(() => {
        /* Snippet failed to load — bubble stays hidden */
      });

    return () => {
      cancelled = true;
      styleObserver?.disconnect();
      chatBubble?.remove();
    };
  }, [isAuthenticated]);

  if (!apiUrl || sessionPending || !isAuthenticated) {
    return null;
  }

  return <div ref={hostRef} />;
}
