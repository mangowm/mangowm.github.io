import { docsUrl, embed, sectionFor } from "./preview.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

const ephemeral = (content) => json({ type: 4, data: { content, flags: 64 } });

const commands = new Map([["preview", preview]]);

export async function handle(request, env, deps) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/connect") {
    if (request.headers.get("x-gateway-secret") !== env.GATEWAY_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }

    return json(await deps.getGateway(env).start());
  }

  if (request.method === "GET" && url.pathname === "/status") {
    if (request.headers.get("x-gateway-secret") !== env.GATEWAY_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }

    return json(await deps.getGateway(env).state());
  }

  return interactions(request, env);
}

async function interactions(request, env) {
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
}

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

async function preview(interaction) {
  const input = interaction.data.options?.find((option) => option.name === "url")?.value;
  const url = docsUrl(input);
  if (!url) {
    return ephemeral(
      "Use a docs link such as `https://mangowm.github.io/docs/quick-start/#initial-setup`.",
    );
  }

  let found;
  try {
    found = await sectionFor(url);
  } catch {
    return ephemeral("The preview index is unavailable. Open the link instead.");
  }

  if (found.error === "page") return ephemeral("That page has no previews.");
  if (found.error === "anchor") return ephemeral("That link has no section.");
  if (found.error === "section") {
    return ephemeral(`No section \`#${url.hash.slice(1)}\`.`);
  }

  return json({
    type: 4,
    data: { embeds: [embed(found.base, found.section, found.part, url)] },
  });
}
