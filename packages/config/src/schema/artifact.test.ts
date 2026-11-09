import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

import { buildCatalog } from "./catalog";
import { schema } from "./schema";
import { MANGO_VERSION } from "./version";

function artifact(name: string) {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${MANGO_VERSION}/${name}`, import.meta.url), "utf8"),
  );
}

describe("generated artifacts", () => {
  it("matches the schema source", () => {
    expect(artifact("schema.json")).toEqual(schema);
  });

  it("matches the catalog source", () => {
    expect(artifact("catalog.json")).toEqual(buildCatalog());
  });
});
