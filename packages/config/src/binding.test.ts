import { describe, expect, it } from "vite-plus/test";

import { bindKeyword, bindingKind, formatBinding, parseBinding, parseFlags } from "./binding";
import { ValueError } from "./value";

describe("binding keywords", () => {
  it("recognizes every binding family", () => {
    expect(bindingKind("bind")).toBe("key");
    expect(bindingKind("mousebind")).toBe("mouse");
    expect(bindingKind("axisbind")).toBe("axis");
    expect(bindingKind("gesturebind")).toBe("gesture");
    expect(bindingKind("switchbind")).toBe("switch");
  });

  it("rejects other keywords", () => {
    expect(() => bindingKind("bindsomething")).toThrow(ValueError);
  });

  it("reads key flags in any order", () => {
    expect(parseFlags("bindsr")).toEqual({
      sym: true,
      lock: false,
      release: true,
      pass: false,
      conflict: false,
    });
    expect(parseFlags("bindlc")).toEqual({
      sym: false,
      lock: true,
      release: false,
      pass: false,
      conflict: true,
    });
  });

  it("gives non-key bindings no flags", () => {
    expect(parseFlags("mousebind").conflict).toBe(false);
  });
});

describe("keyboard bindings", () => {
  it("parses modifiers, key, and action", () => {
    expect(parseBinding("bind", "SUPER,Return,spawn,foot")).toEqual({
      kind: "key",
      flags: { sym: false, lock: false, release: false, pass: false, conflict: false },
      mods: "SUPER",
      trigger: "Return",
      fingers: "",
      action: { dispatcher: "spawn", args: "foot" },
    });
  });

  it("keeps NONE as the modifier group", () => {
    const binding = parseBinding("bind", "NONE,XF86MonBrightnessUp,spawn,brightnessctl set +5%");

    expect(binding.mods).toBe("NONE");
    expect(binding.trigger).toBe("XF86MonBrightnessUp");
  });

  it("round-trips the keyword and value", () => {
    const binding = parseBinding("bindc", "SUPER,a,resizewin,+10,0");

    expect(bindKeyword(binding)).toBe("bindc");
    expect(formatBinding(binding)).toBe("SUPER,a,resizewin,+10,0");
  });
});

describe("other bindings", () => {
  it("parses mouse bindings like keyboard bindings", () => {
    const binding = parseBinding("mousebind", "SUPER,btn_left,killclient");

    expect(binding.kind).toBe("mouse");
    expect(binding.trigger).toBe("btn_left");
    expect(formatBinding(binding)).toBe("SUPER,btn_left,killclient");
  });

  it("parses gesture bindings with a finger count", () => {
    const binding = parseBinding("gesturebind", "none,left,3,view,1");

    expect(binding.mods).toBe("none");
    expect(binding.trigger).toBe("left");
    expect(binding.fingers).toBe("3");
    expect(binding.action).toEqual({ dispatcher: "view", args: "1" });
    expect(formatBinding(binding)).toBe("none,left,3,view,1");
  });

  it("parses switch bindings without modifiers", () => {
    const binding = parseBinding("switchbind", "fold,togglefloating");

    expect(binding.mods).toBe("");
    expect(binding.trigger).toBe("fold");
    expect(formatBinding(binding)).toBe("fold,togglefloating");
  });
});
