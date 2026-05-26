import "dotenv/config";
import { writeFileSync } from "fs";
import { resolve } from "path";

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string;
  html_url: string;
}

async function fetchReleases() {
  if (process.env.SKIP_FETCH_VERSION === "true") {
    console.log("SKIP_FETCH_VERSION is set, skipping release fetch.");
    return;
  }
  console.log("Fetching releases from GitHub...");

  const res = await fetch("https://api.github.com/repos/mangowm/mango/releases", {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

  const data: GitHubRelease[] = await res.json();
  const releases = data.filter((r) => !r.draft);

  const outPath = resolve("src/releases.json");
  writeFileSync(outPath, JSON.stringify(releases, null, 2), "utf-8");
  console.log(`✓ Written ${releases.length} releases to src/releases.json`);

  if (releases.length > 0) {
    const latest = releases[0];
    const latestVersionPath = resolve("src/lib/latest-version.ts");
    const version = latest.tag_name.startsWith("v") ? latest.tag_name : `v${latest.tag_name}`;
    writeFileSync(
      latestVersionPath,
      `export const latestVersion = "${version}" as const;\n`,
      "utf-8",
    );
    console.log(`✓ Written latest version to src/lib/latest-version.ts`);
  }
}

fetchReleases().catch((err) => {
  console.error("Failed to fetch releases:", err.message);
  process.exit(1);
});
