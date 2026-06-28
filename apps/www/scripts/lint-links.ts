import path from "node:path";
import { fileURLToPath } from "node:url";
import { printErrors, scanURLs, validateFiles } from "next-validate-link";
import {
  augmentScannedUrls,
  buildPopulate,
  getAllContentFiles,
} from "@/lib/docs/link-validation";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

async function checkLinks(): Promise<void> {
  const scanned = await scanURLs({
    preset: "next",
    cwd: appRoot,
    populate: buildPopulate(),
  });
  augmentScannedUrls(scanned);

  printErrors(
    await validateFiles(await getAllContentFiles(), {
      scanned,
      markdown: {
        components: {
          Card: { attributes: ["href"] },
        },
      },
      checkRelativePaths: "as-url",
    }),
    true
  );
}

await checkLinks();
