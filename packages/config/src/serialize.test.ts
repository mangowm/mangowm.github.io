import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { normalizeConf } from "./normalize";
import { serializeConf } from "./serialize";
import type { CanonicalConfig } from "./types";

function roundTrip(config: CanonicalConfig): CanonicalConfig {
  const text = serializeConf(config);
  const { config: normalized, warnings } = normalizeConf(parseConf(text));
  expect(warnings).toEqual([]);
  return normalized;
}

describe("serializeConf", () => {
  it("writes globals, pairs, directives, rules, and bindings", () => {
    const config: CanonicalConfig = {
      global: { blur: true, root_color: "0x323232ff", exec: ["waybar"] },
      env: { DPI: "140" },
      var: { term: "foot" },
      bind: { default: { "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }] } },
      rule: { window_rule: [{ app_id: "firefox", tags: [1, 3], is_floating: true }] },
    };

    const text = serializeConf(config);

    expect(text).toContain("blur = 1");
    expect(text).toContain("root_color = 0x323232ff");
    expect(text).toContain("exec = waybar");
    expect(text).toContain("env = DPI,140");
    expect(text).toContain("var = term,foot");
    expect(text).toContain("window_rule = is_floating:1,app_id:firefox,tags:1|3");
    expect(text).toContain("key_mode = default");
    expect(text).toContain("bind = SUPER,Return,spawn,foot");
  });

  it("round-trips a canonical config", () => {
    const config: CanonicalConfig = {
      global: {
        blur: true,
        root_color: "0x323232ff",
        animation_duration_move: 250,
        circle_layout: ["tile", "scroller"],
        exec: ["waybar"],
      },
      env: { DPI: "140" },
      var: { term: "foot" },
      bind: {
        default: {
          "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }],
          lock: { "SUPER+L": [{ dispatcher: "spawn", args: "swaylock" }] },
        },
      },
      mousebind: { default: { "SUPER+btn_left": [{ dispatcher: "killclient" }] } },
      gesturebind: { default: { "none+left+3": [{ dispatcher: "view", args: "1" }] } },
      switchbind: { default: { fold: [{ dispatcher: "togglefloating" }] } },
      rule: {
        window_rule: [{ app_id: "firefox", tags: [1, 3], is_floating: true }],
      },
    };

    expect(roundTrip(config)).toEqual(config);
  });

  it("writes one line per conflicting action", () => {
    const config: CanonicalConfig = {
      bind: {
        default: {
          conflict: {
            "SUPER+a": [{ dispatcher: "resizewin", args: "+10,0" }, { dispatcher: "centerwin" }],
          },
        },
      },
    };

    const text = serializeConf(config);

    expect(text).toContain("bindc = SUPER,a,resizewin,+10,0");
    expect(text).toContain("bindc = SUPER,a,centerwin");
  });

  it("writes a bare trigger with the NONE modifier", () => {
    const text = serializeConf({ bind: { default: { super_l: [{ dispatcher: "spawn" }] } } });

    expect(text).toContain("bind = NONE,super_l,spawn");
  });

  it("writes nothing for an empty config", () => {
    expect(serializeConf({})).toBe("");
  });
});
