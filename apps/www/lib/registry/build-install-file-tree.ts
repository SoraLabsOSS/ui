import type { FileTreeElement } from "@workspace/ui/components/unlumen-ui/file-tree";

const PROJECT_ROOT_ID = "your-project";
const PROJECT_ROOT_LABEL = "your-project";

function ensureFolder(
  parent: FileTreeElement,
  segment: string,
  id: string
): FileTreeElement {
  const children = parent.children ?? [];
  const existing = children.find(
    (child) => child.type === "folder" && child.name === segment
  );

  if (existing) {
    return existing;
  }

  const folder: FileTreeElement = {
    id,
    name: segment,
    type: "folder",
    defaultOpen: true,
    children: [],
  };

  parent.children = [...children, folder];
  return folder;
}

/** Build a nested folder tree from shadcn registry install targets. */
export function buildInstallFileTree(targets: string[]): FileTreeElement[] {
  const normalizedTargets = [
    ...new Set(targets.map((target) => target.trim()).filter(Boolean)),
  ];

  if (normalizedTargets.length === 0) {
    return [];
  }

  const root: FileTreeElement = {
    id: PROJECT_ROOT_ID,
    name: PROJECT_ROOT_LABEL,
    type: "folder",
    defaultOpen: true,
    children: [],
  };

  for (const target of normalizedTargets) {
    const segments = target.split("/").filter(Boolean);
    const fileName = segments.pop();

    if (!fileName) {
      continue;
    }

    let current = root;
    let pathId = PROJECT_ROOT_ID;

    for (const segment of segments) {
      pathId = `${pathId}/${segment}`;
      current = ensureFolder(current, segment, pathId);
    }

    const fileId = `${pathId}/${fileName}`;
    const children = current.children ?? [];

    if (!children.some((child) => child.id === fileId)) {
      current.children = [
        ...children,
        {
          id: fileId,
          name: fileName,
          type: "file",
          highlight: true,
        },
      ];
    }
  }

  return [root];
}
