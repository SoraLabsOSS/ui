import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const WWW_ROOT = process.cwd();
const PUBLIC_R = path.join(WWW_ROOT, "public", "r");

interface RegistryFileEntry {
  content?: string;
  path?: string;
  target?: string;
  type?: string;
}

interface RegistryJsonItem {
  files?: RegistryFileEntry[];
  items?: unknown[];
  name?: string;
  type?: string;
}

async function validateFileEntry(
  f: RegistryFileEntry,
  fileName: string
): Promise<number> {
  let errors = 0;
  if (!f.path) {
    console.error(`❌ Missing path in file entry of ${fileName}`);
    return 1;
  }

  const diskPath = path.join(WWW_ROOT, f.path);
  try {
    await fs.access(diskPath);
  } catch {
    console.error(
      `❌ File path does not exist on disk: ${f.path} (referenced by ${fileName})`
    );
    errors++;
  }

  if (f.content) {
    if (f.content.includes("@/registry/")) {
      console.error(
        `❌ Untranslated "@/registry/" found in content of ${fileName} (${f.path})`
      );
      errors++;
    }
    if (f.content.includes("@workspace/ui/")) {
      console.error(
        `❌ Untranslated "@workspace/ui/" found in content of ${fileName} (${f.path})`
      );
      errors++;
    }
  }

  return errors;
}

async function validateSingleJsonFile(fileName: string): Promise<number> {
  const filePath = path.join(PUBLIC_R, fileName);
  const content = await fs.readFile(filePath, "utf-8");
  let parsed: RegistryJsonItem;

  try {
    parsed = JSON.parse(content) as RegistryJsonItem;
  } catch (err) {
    console.error(`❌ Invalid JSON in ${fileName}:`, err);
    return 1;
  }

  if (fileName === "registry.json") {
    if (!(parsed.items && Array.isArray(parsed.items))) {
      console.error("❌ registry.json missing items array");
      return 1;
    }
    return 0;
  }

  let errors = 0;
  if (!parsed.name) {
    console.error(`❌ Missing name in ${fileName}`);
    errors++;
  }

  if (parsed.files && Array.isArray(parsed.files)) {
    for (const f of parsed.files) {
      errors += await validateFileEntry(f, fileName);
    }
  }

  return errors;
}

async function checkJsonFiles(): Promise<void> {
  console.log("🔍 [1/4] Checking public/r JSON files validity...");
  const files = await fs.readdir(PUBLIC_R);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  console.log(`Found ${jsonFiles.length} registry JSON files in public/r/`);

  let totalErrors = 0;
  for (const file of jsonFiles) {
    totalErrors += await validateSingleJsonFile(file);
  }

  if (totalErrors > 0) {
    throw new Error(`Integrity check failed with ${totalErrors} errors`);
  }
  console.log(
    "✅ All JSON files in public/r are valid and paths exist on disk!"
  );
}

async function setupConsumerFiles(sandboxDir: string): Promise<void> {
  const packageJson = {
    name: "consumer-app",
    private: true,
    type: "module",
  };
  await fs.writeFile(
    path.join(sandboxDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      lib: ["DOM", "DOM.Iterable", "ES2022"],
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      ignoreDeprecations: "6.0",
      baseUrl: ".",
      paths: {
        "@/*": ["./*"],
      },
    },
    include: ["**/*.ts", "**/*.tsx"],
  };
  await fs.writeFile(
    path.join(sandboxDir, "tsconfig.json"),
    JSON.stringify(tsconfig, null, 2)
  );

  await fs.mkdir(path.join(sandboxDir, "lib"), { recursive: true });
  await fs.writeFile(
    path.join(sandboxDir, "lib", "utils.ts"),
    'export function cn(...inputs: unknown[]) { return inputs.filter(Boolean).join(" "); }\n'
  );

  const itemsToTest = [
    "base-checkbox.json",
    "radix-checkbox.json",
    "bottom-sheet.json",
    "border-trail.json",
    "text-effect.json",
    "demo-checkbox.json",
    "demo-radix-checkbox.json",
    "demo-bottom-sheet.json",
    "hooks-use-controlled-state.json",
    "hooks-use-prefers-reduced-motion.json",
    "lib-get-strict-context.json",
    "lib-ease.json",
  ];

  for (const itemFile of itemsToTest) {
    const itemPath = path.join(PUBLIC_R, itemFile);
    const itemData = JSON.parse(
      await fs.readFile(itemPath, "utf-8")
    ) as RegistryJsonItem;
    if (itemData.files) {
      for (const f of itemData.files) {
        if (f.content) {
          const targetPath = path.join(sandboxDir, f.target ?? f.path ?? "");
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, f.content);
        }
      }
    }
  }

  await fs.writeFile(
    path.join(sandboxDir, "app.tsx"),
    `import React from "react";
import { Checkbox as BaseCheckbox } from "@/components/sora-ui/base/checkbox";
import { Checkbox as RadixCheckbox } from "@/components/sora-ui/radix/checkbox";
import { BottomSheet } from "@/components/sora-ui/radix/bottom-sheet";
import { BorderTrail } from "@/components/sora-ui/effects/border-trail";
import { TextEffect } from "@/components/sora-ui/texts/text-effect";
import BaseCheckboxDemo from "@/components/sora-ui/demo/base/checkbox";
import RadixCheckboxDemo from "@/components/sora-ui/demo/radix/checkbox";
import BottomSheetDemo from "@/components/sora-ui/demo/radix/bottom-sheet";

export default function App() {
  return (
    <div>
      <BaseCheckbox label="Test Base Checkbox" />
      <RadixCheckbox label="Test Radix Checkbox" />
      <BottomSheet open={false} />
      <BorderTrail />
      <TextEffect>Testing text effect</TextEffect>
      <BaseCheckboxDemo />
      <RadixCheckboxDemo />
      <BottomSheetDemo />
    </div>
  );
}
`
  );
}

async function testConsumerInstallation(): Promise<void> {
  console.log(
    "\n🧪 [2/4] Simulating Consumer Installation in isolated sandbox..."
  );
  const sandboxDir = path.join(WWW_ROOT, "node_modules", ".test-consumer");
  await fs.rm(sandboxDir, { recursive: true, force: true });
  await fs.mkdir(sandboxDir, { recursive: true });

  try {
    await setupConsumerFiles(sandboxDir);
    console.log("✅ Extracted installed files into sandbox environment.");

    console.log(
      "\n📦 [3/4] Typechecking installed components with TypeScript in consumer sandbox..."
    );
    const tscPath = path.resolve(WWW_ROOT, "../../node_modules/.bin/tsc.exe");
    execSync(`"${tscPath}" --noEmit -p "${sandboxDir}/tsconfig.json"`, {
      stdio: "pipe",
    });
    console.log("✅ Consumer TypeScript check PASSED with 0 errors!");
  } finally {
    await fs.rm(sandboxDir, { recursive: true, force: true });
    console.log("🧹 Cleaned up test sandbox.");
  }
}

function verifyMonorepoBuild(): void {
  console.log("\n🌐 [4/4] Verifying monorepo typecheck...");
  execSync("bun.cmd run check-types", {
    cwd: path.resolve(WWW_ROOT, "../.."),
    stdio: "inherit",
  });
  console.log("✅ Monorepo TypeScript check PASSED with 0 errors!");
}

async function runIntegrityCheck(): Promise<void> {
  await checkJsonFiles();
  await testConsumerInstallation();
  verifyMonorepoBuild();
  console.log("\n🎉 ALL 4/4 INTEGRITY & INSTALLATION CHECKS PASSED PERFECTLY!");
}

runIntegrityCheck().catch((err: unknown) => {
  console.error("Test failed:", err);
  process.exit(1);
});
