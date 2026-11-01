import { ATTR_DEBUG, ATTR_ITEM, ATTR_ROOT, ATTR_SLOT, ATTR_SR } from "./defs";

const TORPH_CSS = `
[${ATTR_ROOT}] {
  display: inline-block;
  position: relative;
  vertical-align: top;
  will-change: width, height;
  white-space: nowrap;
  text-align: inherit;
}

[${ATTR_ITEM}]:not(br) {
  display: inline-block;
  position: relative;
  will-change: opacity, transform;
  transform: none;
  opacity: 1;
}

[${ATTR_SR}] {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: pre;
  -webkit-user-select: none;
  user-select: none;
}

[${ATTR_SLOT}] {
  clip-path: inset(0 -100vw);
}

[${ATTR_SLOT}] > span {
  display: inline-block;
  will-change: opacity, transform;
}

@supports (mask-clip: no-clip) or (-webkit-mask-clip: no-clip) {
  [${ATTR_SLOT}] {
    --torph-mask: linear-gradient(
      to bottom,
      transparent,
      #000 var(--torph-fade, 0.15em),
      #000 calc(100% - var(--torph-fade, 0.15em)),
      transparent
    );
    -webkit-mask-image: var(--torph-mask);
    mask-image: var(--torph-mask);
    -webkit-mask-repeat: repeat-x;
    mask-repeat: repeat-x;
    -webkit-mask-clip: no-clip;
    mask-clip: no-clip;
  }
}

[${ATTR_ROOT}][${ATTR_DEBUG}] {
  outline: 2px solid magenta;
}

[${ATTR_ROOT}][${ATTR_DEBUG}] [${ATTR_ITEM}] {
  outline: 2px solid cyan;
  outline-offset: -4px;
}
`;

let styleEl: HTMLStyleElement | null = null;
let styleRefCount = 0;

export function addStyles() {
  if (typeof document === "undefined") {
    return;
  }
  styleRefCount++;
  if (styleEl) {
    return;
  }

  styleEl = document.createElement("style");
  styleEl.dataset.torph = "true";
  styleEl.textContent = TORPH_CSS;
  document.head.appendChild(styleEl);
}

export function removeStyles() {
  styleRefCount--;
  if (styleRefCount > 0 || !styleEl) {
    return;
  }

  styleEl.remove();
  styleEl = null;
}
