type Listener = () => void;

let open = false;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Shared `open` state for the Ask AI panel.
 *
 * Kept outside React because the navbar trigger and the chat runtime are
 * siblings, not parent/child — the navbar renders before (and outside) the
 * AI provider. It also lets the navbar trigger stay lightweight: importing it
 * must not pull the AI SDK / chat runtime into the critical bundle.
 */
export const aiChatOpenStore = {
  getOpen: () => open,

  /** Server snapshot — the panel is always closed during SSR. */
  getServerOpen: () => false,

  setOpen: (next: boolean) => {
    if (open === next) {
      return;
    }
    open = next;
    notify();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
