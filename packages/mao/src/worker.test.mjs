import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import worker from "./worker.js";

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

const preview = (url) => ({
  type: 2,
  data: { name: "preview", options: [{ name: "url", type: 3, value: url }] },
});

const env = { DISCORD_PUBLIC_KEY: publicKeyHex };

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

const stubManifest = (value = manifest) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(value))),
  );

afterEach(() => vi.unstubAllGlobals());

describe("worker", () => {
  it("answers the ping", async () => {
    const response = await worker.fetch(interaction({ type: 1 }), env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ type: 1 });
  });

  it("rejects a bad signature", async () => {
    const response = await worker.fetch(interaction({ type: 1 }, "00".repeat(64)), env);
    expect(response.status).toBe(401);
  });

  it("returns the section image", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/quick-start/#initial-setup";
    const body = await (await worker.fetch(interaction(preview(url)), env)).json();

    expect(body.type).toBe(4);
    expect(body.data.embeds[0].title).toBe("Initial Setup");
    expect(body.data.embeds[0].image.url).toBe(
      "https://mangowm.github.io/docs/_previews/quick-start/initial-setup.webp",
    );
  });

  it("returns one image per request", async () => {
    stubManifest(longManifest);
    const url = "https://mangowm.github.io/docs/quick-start/#initial-setup";
    const body = await (await worker.fetch(interaction(preview(url)), env)).json();

    expect(body.data.embeds).toHaveLength(1);
    expect(body.data.embeds[0].image.url).toBe("https://mangowm.github.io/docs/_previews/a.webp");
  });

  it("asks for an anchor", async () => {
    stubManifest();
    const body = await (
      await worker.fetch(interaction(preview("https://mangowm.github.io/docs/quick-start/")), env)
    ).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toBe("That link has no section.");
  });

  it("reports pages without previews", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/v0.18.4/#intro";
    const body = await (await worker.fetch(interaction(preview(url)), env)).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("no previews");
  });

  it("reports unknown anchors", async () => {
    stubManifest();
    const url = "https://mangowm.github.io/docs/quick-start/#nope";
    const body = await (await worker.fetch(interaction(preview(url)), env)).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toBe("No section `#nope`.");
  });

  it("rejects other hosts", async () => {
    const url = "https://example.com/docs/quick-start/#initial-setup";
    const body = await (await worker.fetch(interaction(preview(url)), env)).json();

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("docs link");
  });

  it("rejects unknown commands", async () => {
    const payload = { type: 2, data: { name: "nope" } };
    const response = await worker.fetch(interaction(payload), env);
    expect(response.status).toBe(404);
  });
});
