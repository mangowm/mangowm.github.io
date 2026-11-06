import { describe, expect, it } from "vite-plus/test";

import {
  ALL_BIND_VARIANTS,
  TYPE_TO_KEYWORD,
  parseSingleBinding,
  serializeBinding,
} from "./keybind-parse";

describe("keybind parsing", () => {
  it("parses a keyboard binding", () => {
    const binding = parseSingleBinding("bind", 0, "SUPER,Return,spawn,foot");

    expect(binding).toMatchObject({
      type: "keyboard",
      mods: "SUPER",
      key: "Return",
      func: "spawn",
      args: "foot",
      mode: "default",
    });
    expect(binding?.flags).toEqual({
      symOnly: false,
      onLock: false,
      onRelease: false,
      pass: false,
      allowConflict: false,
    });
  });

  it("parses switch and gesture bindings", () => {
    const switchBinding = parseSingleBinding("switchbind", 0, "fold,view,1");
    expect(switchBinding).toMatchObject({ type: "switch", key: "fold", func: "view", args: "1" });

    const gesture = parseSingleBinding("gesturebind", 0, "SUPER,up,3,spawn,foot");
    expect(gesture).toMatchObject({
      type: "gesture",
      mods: "SUPER",
      key: "up",
      fingers: "3",
      func: "spawn",
      args: "foot",
    });
  });

  it("serializes back to the same value", () => {
    for (const value of ["SUPER,Return,spawn,foot", "NONE,Q,killclient"]) {
      const binding = parseSingleBinding("bind", 0, value);
      expect(binding && serializeBinding(binding)).toBe(value);
    }
  });

  it("returns null for malformed bindings", () => {
    expect(parseSingleBinding("bind", 0, "SUPER,Return")).toBeNull();
  });

  it("generates the bind variants and keywords", () => {
    expect(ALL_BIND_VARIANTS).toHaveLength(32);
    expect(ALL_BIND_VARIANTS).toContain("bindslrpc");
    expect(TYPE_TO_KEYWORD).toEqual({
      keyboard: "bind",
      mouse: "mousebind",
      axis: "axisbind",
      switch: "switchbind",
      gesture: "gesturebind",
    });
  });
});
