const docModules = import.meta.glob<string>("@/components/sections/**/*.docs.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const docMap = new Map<string, string>();

for (const [path, content] of Object.entries(docModules)) {
  const match = path.match(/([^/]+)\.docs\.md$/);
  if (match) {
    docMap.set(match[1], content);
  }
}

export function getDocs(sectionId: string): string | undefined {
  return docMap.get(sectionId);
}
