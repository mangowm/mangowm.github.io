import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { handle } from "./app.js";
import { previewMessage } from "./preview.js";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicKeyHex = Buffer.from(publicKey.export({ format: "jwk" }).x, "base64url").toString(
  "hex",
);

const manifest = {
  base: "https://mangowm.github.io/docs/_previews/",
  pages: {
    "/docs/quick-start/": {
      title: "Quick Start",
      sections: {
        "initial-setup": { title: "Initial Setup", parts: ["quick-start/initial-setup.webp"] },
      },
    },
  },
};

const longManifest = {
  ...manifest,
  pages: {
    "/docs/quick-start/": {
      title: "Quick Start",
      sections: {
        "initial-setup": {
          title: "Initial Setup",
          parts: ["a.webp", "b.webp", "c.webp", "d.webp", "e.webp"],
        },
      },
    },
  },
};

const env = {
  DISCORD_PUBLIC_KEY: publicKeyHex,
  DISCORD_BOT_TOKEN: "bot-token",
  GATEWAY_SECRET: "gateway-secret",
};

const gateway = {
  start: async () => ({ online: false }),
  state: async () => ({ online: true, session: true, tries: 0, error: null }),
};

const deps = { getGateway: () => gateway };
const run = (request, environment = env) => handle(request, environment, deps);

function interaction(payload, signature) {
  const body = JSON.stringify(payload);
  const timestamp = "1700000000";
  const value = signature ?? sign(null, Buffer.from(timestamp + body), privateKey).toString("hex");

  return new Request("https://worker.test/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-signature-ed25519": value,
      "x-signature-timestamp": timestamp,
    },
    body,
  });
}

const message = (content) => ({ content, channel_id: "123", author: { bot: false } });

const preview = (url) => ({
  type: 2,
  data: { name: "preview", options: [{ name: "url", type: 3, value: url }] },
});

const stubManifest = (value = manifest) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(value))),
  );

const stubApi = (value = manifest) => {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input, init) => {
      const url = typeof input === "string" ? input : input.url;
      calls.push({ url, init });
      if (url.endsWith("index.json")) return new Response(JSON.stringify(value));
      return new Response("{}", { status: 200 });
    }),
  );
  return calls;
};

afterEach(() => vi.unstubAllGlobals());

describe("worker", () => {
  it("answers the ping", async () => {
    const response = await run(interaction({ type: 1 }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ type: 1 });
  });

  it("rejects a bad signature", async () => {
    const response = await run(interaction({ type: 1 }, "00".repeat(64)));
    expect(response.status).toBe(401);
  });

  it("returns the section image", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/quick-start/#initial-setup";
    const body = await (await run(interaction(preview(url)))).json();

    expect(body.type).toBe(4);
    expect(body.data.embeds[0].title).toBe("Initial Setup");
    expect(body.data.embeds[0].image.url).toBe(
      "https://mangowm.github.io/docs/_previews/quick-start/initial-setup.webp",
    );
  });

  it("returns one image per request", async () => {
    stubManifest(longManifest);
    const url = "https://mangowm.github.io/docs/quick-start/#initial-setup";
    const body = await (await run(interaction(preview(url)))).json();

    expect(body.data.embeds).toHaveLength(1);
    expect(body.data.embeds[0].image.url).toBe("https://mangowm.github.io/docs/_previews/a.webp");
  });

  it("asks for an anchor", async () => {
    stubManifest();
    const body = await (
      await run(interaction(preview("https://mangowm.github.io/docs/quick-start/")))
    ).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toBe("That link has no section.");
  });

  it("reports pages without previews", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/v0.18.4/#intro";
    const body = await (await run(interaction(preview(url)))).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("no previews");
  });

  it("reports unknown anchors", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/quick-start/#nope";
    const body = await (await run(interaction(preview(url)))).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toBe("No section `#nope`.");
  });

  it("rejects other hosts", async () => {
    const url = "https://example.com/docs/quick-start/#initial-setup";
    const body = await (await run(interaction(preview(url)))).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("docs link");
  });

  it("rejects unknown commands", async () => {
    const response = await run(interaction({ type: 2, data: { name: "nope" } }));
    expect(response.status).toBe(404);
  });

  it("posts an image for a bare docs link", async () => {
    const calls = stubApi();
    await previewMessage(message("https://mangowm.github.io/docs/quick-start/#initial-setup"), env);

    const post = calls.find(
      (call) => call.url === "https://discord.com/api/v10/channels/123/messages",
    );
    expect(post).toBeTruthy();
    expect(post.init.body).toContain("quick-start/initial-setup.webp");
  });

  it("posts an image for a link with text around it", async () => {
    const calls = stubApi();
    await previewMessage(
      message("see https://mangowm.github.io/docs/quick-start/#initial-setup"),
      env,
    );

    const post = calls.find(
      (call) => call.url === "https://discord.com/api/v10/channels/123/messages",
    );
    expect(post).toBeTruthy();
    expect(post.init.body).toContain("quick-start/initial-setup.webp");
  });

  it("ignores messages without a docs link", async () => {
    const calls = stubApi();
    await previewMessage(message("no link here"), env);
    expect(calls).toHaveLength(0);
  });

  it("ignores other bots", async () => {
    const calls = stubApi();
    const event = message("https://mangowm.github.io/docs/quick-start/#initial-setup");
    event.author.bot = true;

    await previewMessage(event, env);
    expect(calls).toHaveLength(0);
  });

  it("connects the gateway", async () => {
    const start = vi.fn(async () => ({ online: false }));
    const withGateway = { getGateway: () => ({ ...gateway, start }) };
    const request = new Request("https://worker.test/connect", {
      method: "POST",
      headers: { "x-gateway-secret": env.GATEWAY_SECRET },
    });

    expect((await handle(request, env, withGateway)).status).toBe(200);
    expect(start).toHaveBeenCalledOnce();
  });

  it("reports the gateway status", async () => {
    const request = new Request("https://worker.test/status", {
      headers: { "x-gateway-secret": env.GATEWAY_SECRET },
    });

    const body = await (await run(request)).json();
    expect(body).toMatchObject({ online: true, session: true });
  });

  it("rejects an unsigned gateway connect", async () => {
    const request = new Request("https://worker.test/connect", {
      method: "POST",
      headers: { "x-gateway-secret": "wrong" },
    });

    expect((await run(request)).status).toBe(401);
  });
});
