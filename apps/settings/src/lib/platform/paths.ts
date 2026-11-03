export function commonAncestorDir(absPaths: string[]): string {
  if (absPaths.length === 0) return "";
  if (absPaths.length === 1) {
    return absPaths[0].slice(0, absPaths[0].lastIndexOf("/"));
  }

  const splitPaths = absPaths.map((path) => path.split("/"));
  let index = 0;
  while (index < splitPaths[0].length) {
    const segment = splitPaths[0][index];
    if (splitPaths.every((parts) => index < parts.length && parts[index] === segment)) {
      index++;
    } else {
      break;
    }
  }

  if (index < 2) return "";
  return splitPaths[0].slice(0, index).join("/");
}

export function resolvePath(base: string, relative: string): string {
  const parts = (base ? base.split("/") : []).concat(relative.split("/"));
  const result: string[] = [];

  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      result.pop();
      continue;
    }
    result.push(part);
  }

  return result.join("/");
}

export function sourcePaths(text: string): string[] {
  const paths: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;

    if (trimmed.slice(0, equals).trim() !== "source") continue;

    const value = trimmed.slice(equals + 1).trim();
    const unquoted =
      value.length >= 2 &&
      (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0])
        ? value.slice(1, -1)
        : value;

    if (unquoted !== "") paths.push(unquoted);
  }

  return paths;
}
