"use client";

let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalPaddingRight = "";

export const lockScroll = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (lockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
  lockCount += 1;
};

export const unlockScroll = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (lockCount > 0) {
    lockCount -= 1;
    if (lockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }
  }
};
