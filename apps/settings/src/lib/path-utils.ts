export function commonAncestorDir(absPaths: string[]): string {
  if (absPaths.length === 0) return "";
  if (absPaths.length === 1) {
    return absPaths[0].slice(0, absPaths[0].lastIndexOf("/"));
  }

  const splitPaths = absPaths.map((p) => p.split("/"));
  let i = 0;
  while (i < splitPaths[0].length) {
    const seg = splitPaths[0][i];
    if (splitPaths.every((s) => i < s.length && s[i] === seg)) {
      i++;
    } else {
      break;
    }
  }

  if (i < 2) return "";
  return splitPaths[0].slice(0, i).join("/");
}
