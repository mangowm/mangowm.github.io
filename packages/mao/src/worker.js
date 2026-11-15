const json = (data) =>
  new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });

const ephemeral = (content) => json({ type: 4, data: { content, flags: 64 } });

const commands = new Map([["preview", preview]]);

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("method not allowed", { status: 405 });

    const body = await request.text();
    if (!(await verify(request, body, env.DISCORD_PUBLIC_KEY))) {
      return new Response("invalid request signature", { status: 401 });
    }

    let interaction;
    try {
      interaction = JSON.parse(body);
    } catch {
      return new Response("invalid payload", { status: 400 });
    }

    if (interaction.type === 1) return json({ type: 1 });
    if (interaction.type !== 2) return new Response("unsupported interaction", { status: 400 });

    const command = commands.get(interaction.data?.name);
    if (!command) return new Response("unknown command", { status: 404 });

    return command(interaction);
  },
};

async function verify(request, body, publicKey) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp || !publicKey) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    decodeHex(publicKey),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  const data = new TextEncoder().encode(timestamp + body);
  return crypto.subtle.verify({ name: "Ed25519" }, key, decodeHex(signature), data);
}

function decodeHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

// preview

const DOCS_ORIGIN = "https://mangowm.github.io";
const PREVIEWS_BASE = `${DOCS_ORIGIN}/docs/_previews/`;
const EMBED_COLOR = 0xd97706;

async function preview(interaction) {
  const input = interaction.data.options?.find((option) => option.name === "url")?.value;
  const url = docsUrl(input);
  if (!url) {
    return ephemeral(
      "Use a docs link such as `https://mangowm.github.io/docs/quick-start/#initial-setup`.",
    );
  }

  let manifest;
  try {
    manifest = await loadManifest(PREVIEWS_BASE);
  } catch {
    return ephemeral("The preview index is unavailable. Open the link instead.");
  }

  const page = manifest.pages?.[url.pathname] ?? manifest.pages?.[`${url.pathname}/`];
  if (!page) return ephemeral("That page has no previews.");

  const anchor = url.hash.slice(1);
  if (!anchor) return ephemeral("That link has no section.");

  const section = page.sections?.[anchor];
  const [part] = section?.parts ?? [];
  if (!part) return ephemeral(`No section \`#${anchor}\`.`);

  const base = manifest.base ?? PREVIEWS_BASE;

  return json({
    type: 4,
    data: {
      embeds: [
        {
          title: section.title,
          url: url.href,
          color: EMBED_COLOR,
          image: { url: base + part },
        },
      ],
    },
  });
}

function docsUrl(input) {
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

async function loadManifest(base) {
  const response = await fetch(`${base}index.json`, {
    cf: { cacheTtl: 600, cacheEverything: true },
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error(`index ${response.status}`);
  return response.json();
}
