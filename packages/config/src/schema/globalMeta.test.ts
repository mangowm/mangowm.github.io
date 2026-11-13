import { describe, expect, it } from "vite-plus/test";

import { CATEGORIES } from "./data/categories";
import { GLOBAL_META } from "./data/globalMeta";
import { GLOBALS } from "./data/globals";

const categoryIds = new Set(Object.keys(CATEGORIES));

describe("global metadata", () => {
  it("covers every global option", () => {
    expect(Object.keys(GLOBAL_META).sort()).toEqual(GLOBALS.map((option) => option.key).sort());
  });

  it("uses known categories", () => {
    for (const meta of Object.values(GLOBAL_META)) {
      expect(categoryIds).toContain(meta.category);
    }
  });

  it("uses unique non-empty aliases", () => {
    for (const meta of Object.values(GLOBAL_META)) {
      if (!meta.aliases) continue;
      expect(new Set(meta.aliases).size).toBe(meta.aliases.length);
      for (const alias of meta.aliases) expect(alias.trim()).not.toBe("");
    }
  });
});
