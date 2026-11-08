import { describe, expect, it } from "vite-plus/test";

import { BINDING_KEY_PATTERNS } from "./data/bindingKeys";
import {
  BINDING_DIRECTIONS,
  BINDING_FLAG_LETTERS,
  BINDING_FLAGS,
  BINDING_FOLD_STATES,
  BINDING_KEYWORDS,
  BINDING_KINDS,
  MOUSE_BUTTONS,
  MODIFIER_ORDER,
} from "./data/bindings";

const patterns = Object.fromEntries(
  Object.entries(BINDING_KEY_PATTERNS).map(([kind, pattern]) => [kind, new RegExp(pattern)]),
);

describe("binding constants", () => {
  it("defines each binding family and keyword", () => {
    expect(BINDING_KINDS).toEqual(["key", "mouse", "axis", "gesture", "switch"]);
    expect(Object.keys(BINDING_KEYWORDS)).toEqual([...BINDING_KINDS]);
    expect(new Set(Object.values(BINDING_KEYWORDS)).size).toBe(BINDING_KINDS.length);
  });

  it("defines flags in canonical order", () => {
    expect(BINDING_FLAGS).toEqual(["sym", "lock", "release", "pass", "conflict"]);
    expect(BINDING_FLAGS.map((flag) => BINDING_FLAG_LETTERS[flag])).toEqual([
      "s",
      "l",
      "r",
      "p",
      "c",
    ]);
  });

  it("defines the supported mouse buttons and directions", () => {
    expect(MOUSE_BUTTONS).toHaveLength(8);
    expect(MOUSE_BUTTONS).toContain("btn_task");
    expect(BINDING_DIRECTIONS).toEqual(["left", "right", "up", "down", "alldir"]);
    expect(BINDING_FOLD_STATES).toEqual(["fold", "unfold"]);
    expect(MODIFIER_ORDER).toEqual(["super", "ctrl", "alt", "shift", "hyper"]);
  });

  it("builds the expected key patterns", () => {
    expect(patterns.key?.test("SUPER+Return")).toBe(true);
    expect(patterns.key?.test("SUPER+SHIFT+1")).toBe(true);
    expect(patterns.key?.test("sym")).toBe(false);

    expect(patterns.mouse?.test("SUPER+btn_left")).toBe(true);
    expect(patterns.axis?.test("SUPER+alldir")).toBe(true);
    expect(patterns.gesture?.test("SUPER+alldir+3")).toBe(true);
    expect(patterns.switch?.test("fold")).toBe(true);
    expect(patterns.switch?.test("unfold")).toBe(true);
  });
});
