export const basePath =
	process.env.GITHUB_PAGES === "true" ? "" : process.env.VERCEL ? "" : "";
