import { normalizePath } from "obsidian";

/** Join path segments and normalize for Obsidian's vault. */
export function joinPath(...segments: string[]): string {
  const joined = segments
    .filter((s) => s != null && s !== "")
    .join("/")
    .replace(/\/+/g, "/");
  return normalizePath(joined);
}

/** Return true if childPath is inside folderPath (or equal). */
export function isInsideFolder(childPath: string, folderPath: string): boolean {
  const folder = normalizePath(folderPath).replace(/\/$/, "");
  if (!folder || folder === "/" || folder === ".") return true;
  const child = normalizePath(childPath);
  return child === folder || child.startsWith(folder + "/");
}

/** Extract the base filename without extension. */
export function basename(path: string): string {
  const parts = normalizePath(path).split("/");
  const last = parts[parts.length - 1] || "";
  return last.replace(/\.md$/i, "");
}
