const DOCS_ORIGIN = "https://mangowm.github.io";
const PREVIEWS_BASE = `${DOCS_ORIGIN}/docs/_previews/`;
const EMBED_COLOR = 0xd97706;
const API = "https://discord.com/api/v10";
const URL_RE = /https?:\/\/[^\s<>()[\]"']+/g;

export function docsUrl(input) {
  if (typeof input !== "string") return null;

  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.origin !== DOCS_ORIGIN) return null;
  if (!url.pathname.startsWith("/docs/")) return null;
  return url;
}

export function docsLinks(content) {
  const links = [];
  for (const match of content.matchAll(URL_RE)) {
    const url = docsUrl(match[0].replace(/[.,;:!?)\]]+$/, ""));
    if (url && url.hash.length > 1) links.push(url);
  }
  return links;
}

export async function sectionFor(url) {
  const manifest = await loadManifest(PREVIEWS_BASE);
  const page = manifest.pages?.[url.pathname] ?? manifest.pages?.[`${url.pathname}/`];
  if (!page) return { error: "page" };

  const anchor = url.hash.slice(1);
  if (!anchor) return { error: "anchor" };

  const section = page.sections?.[anchor];
  const [part] = section?.parts ?? [];
  if (!part) return { error: "section" };

  return { base: manifest.base ?? PREVIEWS_BASE, section, part };
}

export const embed = (base, section, part, url) => ({
  title: section.title,
  url: url.href,
  color: EMBED_COLOR,
  image: { url: base + part },
});

export async function previewMessage(message, env) {
  if (message.author?.bot || message.webhook_id) return "bot";
  if (!message.content) return "empty";

  const url = docsLinks(message.content)[0];
  if (!url) return "no-link";

  let found;
  try {
    found = await sectionFor(url);
  } catch (error) {
    console.warn("index failed", error?.message ?? error);
    return "index";
  }
  if (found.error) return found.error;

  return post(env, message.channel_id, [embed(found.base, found.section, found.part, url)]);
}

async function post(env, channelId, embeds) {
  const response = await fetch(`${API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ embeds }),
  });

  if (!response.ok) {
    console.error("post failed", response.status, await response.text().catch(() => ""));
  }

  return response.ok ? "posted" : `post ${response.status}`;
}

async function loadManifest(base) {
  const response = await fetch(`${base}index.json`, {
    cf: { cacheTtl: 600, cacheEverything: true },
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error(`index ${response.status}`);
  return response.json();
}
