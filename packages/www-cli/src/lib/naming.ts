import type { PrimitiveCategory } from "./paths.js";

const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function assertKebabCase(name: string): void {
  if (!KEBAB_CASE.test(name)) {
    throw new Error(
      `Invalid name "${name}". Use kebab-case (e.g. my-awesome-effect).`
    );
  }
}

export function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function toTitleCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function categoryLabel(category: PrimitiveCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function defaultDescription(title: string): string {
  return `${title} motion primitive scaffold — replace with a real description.`;
}

export function defaultUiDescription(
  framework: "base" | "radix",
  title: string
): string {
  const source = framework === "base" ? "Base UI" : "Radix UI";
  return `${title} component built on ${source} and Motion — replace with a real description.`;
}

export function uiRegistryName(
  framework: "base" | "radix",
  name: string
): string {
  return `${framework}-${name}`;
}

export function uiDemoRegistryName(
  framework: "base" | "radix",
  name: string
): string {
  return framework === "radix" ? `demo-radix-${name}` : `demo-${name}`;
}

export function uiRegistryTitle(
  framework: "base" | "radix",
  title: string
): string {
  return framework === "base" ? `Base ${title}` : `Radix ${title}`;
}

export function uiDemoComponentName(
  framework: "base" | "radix",
  exportName: string
): string {
  return framework === "radix" ? `Radix${exportName}Demo` : `${exportName}Demo`;
}

export function uiPageSlug(framework: "base" | "radix", name: string): string {
  return `${framework}/${name}`;
}

export function frameworkLabel(framework: "base" | "radix"): string {
  return framework === "base" ? "Base UI" : "Radix UI";
}

export function demoExportName(name: string): string {
  return `${toPascalCase(name)}Demo`;
}
