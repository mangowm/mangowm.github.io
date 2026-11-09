import { describe, expect, it } from "vite-plus/test";

import {
  CATEGORIES,
  DISPATCHER_CATEGORIES,
  DISPATCHER_CATEGORY_ORDER,
  GLOBAL_CATEGORY_ORDER,
  RULE_CATEGORY_ORDER,
  type CategoryId,
} from "./data/categories";
import { DISPATCHERS } from "./data/dispatcherArgs";

const categoryIds = Object.keys(CATEGORIES) as CategoryId[];

describe("categories", () => {
  it("uses mango terminology", () => {
    expect(CATEGORIES.tag.label).toBe("Tags");
    expect(CATEGORIES.monitor.label).toBe("Monitors");
    expect(CATEGORIES.autostart.label).toBe("Autostart");

    for (const category of categoryIds) {
      expect(category).not.toMatch(/workspace|startup/);
      expect(CATEGORIES[category].label).not.toMatch(/workspace|startup/i);
    }
  });

  it("orders only known categories", () => {
    for (const category of [
      ...DISPATCHER_CATEGORY_ORDER,
      ...RULE_CATEGORY_ORDER,
      ...GLOBAL_CATEGORY_ORDER,
    ]) {
      expect(categoryIds).toContain(category);
    }
  });

  it("maps every dispatcher to a known category", () => {
    expect(Object.keys(DISPATCHER_CATEGORIES).sort()).toEqual([...DISPATCHERS].sort());

    for (const dispatcher of DISPATCHERS) {
      expect(categoryIds).toContain(DISPATCHER_CATEGORIES[dispatcher]);
    }
  });

  it("has no unmapped dispatcher categories in the order list", () => {
    const used = new Set(Object.values(DISPATCHER_CATEGORIES));
    const ordered = new Set(DISPATCHER_CATEGORY_ORDER);

    for (const category of used) expect(ordered).toContain(category);
    for (const category of ordered) expect(used).toContain(category);
  });
});
