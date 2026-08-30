const svgMask = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="40" cy="0" r="18" fill="white" filter="url(%23blur)"/></svg>`;

const transitionStyles = `
  ::view-transition-group(root) {
    animation-duration: 1.5s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  ::view-transition-new(root) {
    mask: url('${svgMask}') top right / 0 no-repeat;
    -webkit-mask: url('${svgMask}') top right / 0 no-repeat;
    mask-origin: content-box;
    -webkit-mask-origin: content-box;
    animation: theme-reveal-scale 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform-origin: top right;
  }

  ::view-transition-old(root) {
    animation: none;
    z-index: -1;
  }

  @keyframes theme-reveal-scale {
    from {
      mask-size: 0;
    }
    to {
      mask-size: 350vmax;
    }
  }
`;

export type ThemeMode = "dark" | "light" | "system";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

function injectTransitionStyles(): void {
  const styleId = "theme-transition-styles";
  let styleElement = document.getElementById(
    styleId
  ) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = transitionStyles;
}

export function setThemeWithTransition(
  setTheme: (theme: ThemeMode) => void,
  theme: ThemeMode
): void {
  if (typeof window === "undefined") {
    setTheme(theme);
    return;
  }

  const doc = document as DocumentWithViewTransition;

  if (!doc.startViewTransition) {
    setTheme(theme);
    return;
  }

  injectTransitionStyles();

  const transition = doc.startViewTransition(() => {
    setTheme(theme);
  });
  transition.finished.catch(() => undefined);
}
