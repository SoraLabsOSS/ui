import { describe, expect, it } from "bun:test";
import {
  assertKebabCase,
  demoExportName,
  toPascalCase,
  toTitleCase,
} from "./naming.js";

const KEBAB_CASE_ERROR = /kebab-case/i;

describe("naming", () => {
  it("converts kebab-case to PascalCase", () => {
    expect(toPascalCase("my-text")).toBe("MyText");
    expect(toPascalCase("magnetic-button")).toBe("MagneticButton");
  });

  it("builds demo export names", () => {
    expect(demoExportName("my-text")).toBe("MyTextDemo");
  });

  it("converts kebab-case to title case", () => {
    expect(toTitleCase("border-trail")).toBe("Border Trail");
  });

  it("rejects invalid slugs", () => {
    expect(() => assertKebabCase("MyText")).toThrow(KEBAB_CASE_ERROR);
    expect(() => assertKebabCase("my_text")).toThrow(KEBAB_CASE_ERROR);
  });
});
