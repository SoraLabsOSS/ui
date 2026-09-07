import { describe, expect, it } from "bun:test";
import { extractExports } from "./extract-exports.js";

describe("extractExports", () => {
  it("extracts named function exports", () => {
    const code = `
      export function TextEffect() { return null; }
      export async function AsyncComponent() { return null; }
    `;
    const exports = extractExports(code);
    expect(exports.has("TextEffect")).toBe(true);
    expect(exports.has("AsyncComponent")).toBe(true);
  });

  it("extracts named const/let/var exports including arrow components and memo/forwardRef", () => {
    const code = `
      export const Button = React.forwardRef(() => null);
      export const Card: React.FC = () => null;
      export let Tag = () => null;
    `;
    const exports = extractExports(code);
    expect(exports.has("Button")).toBe(true);
    expect(exports.has("Card")).toBe(true);
    expect(exports.has("Tag")).toBe(true);
  });

  it("extracts named export block with aliases and ignores type exports", () => {
    const code = `
      const InternalA = () => null;
      const InternalB = () => null;
      export { InternalA, InternalB as PublicB, type SomeType };
    `;
    const exports = extractExports(code);
    expect(exports.has("InternalA")).toBe(true);
    expect(exports.has("PublicB")).toBe(true);
    expect(exports.has("SomeType")).toBe(false);
  });

  it("extracts default exports", () => {
    const code = `
      export default function DefaultWidget() { return null; }
    `;
    const exports = extractExports(code);
    expect(exports.has("DefaultWidget")).toBe(true);
    expect(exports.has("default")).toBe(true);
  });

  it("ignores exports in comments", () => {
    const code = `
      // export function CommentedOut() {}
      /*
        export function BlockCommented() {}
      */
      export function RealComponent() {}
    `;
    const exports = extractExports(code);
    expect(exports.has("CommentedOut")).toBe(false);
    expect(exports.has("BlockCommented")).toBe(false);
    expect(exports.has("RealComponent")).toBe(true);
  });
});
