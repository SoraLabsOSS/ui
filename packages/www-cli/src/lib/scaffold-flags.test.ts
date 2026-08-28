import { describe, expect, it } from "bun:test";
import { allowsPrompts, isScripted } from "./scaffold-flags.js";

describe("scaffold flags", () => {
  it("treats --no-input like scripted mode", () => {
    expect(isScripted({ noInput: true })).toBe(true);
    expect(isScripted({ yes: true })).toBe(true);
    expect(isScripted({})).toBe(false);
  });

  it("disables prompts when --no-input is set", () => {
    const originalStdinIsTTY = process.stdin.isTTY;
    const originalStdoutIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });

    try {
      expect(allowsPrompts({ noInput: true })).toBe(false);
      expect(allowsPrompts({})).toBe(true);
    } finally {
      Object.defineProperty(process.stdin, "isTTY", {
        configurable: true,
        value: originalStdinIsTTY,
      });
      Object.defineProperty(process.stdout, "isTTY", {
        configurable: true,
        value: originalStdoutIsTTY,
      });
    }
  });
});
