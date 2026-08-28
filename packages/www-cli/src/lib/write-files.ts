import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export interface ScaffoldFile {
  contents: string;
  relativePath: string;
}

export async function writeScaffoldFiles(
  wwwRoot: string,
  files: ScaffoldFile[]
): Promise<string[]> {
  const written: string[] = [];

  for (const file of files) {
    const absolutePath = path.join(wwwRoot, file.relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.contents, "utf-8");
    written.push(file.relativePath);
  }

  return written;
}

export async function findExistingPaths(
  wwwRoot: string,
  relativePaths: string[]
): Promise<string[]> {
  const existing: string[] = [];
  for (const relativePath of relativePaths) {
    if (await pathExists(path.join(wwwRoot, relativePath))) {
      existing.push(relativePath);
    }
  }
  return existing;
}
