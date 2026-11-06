import { schema } from "@mangowm.github.io/schema";
import Value from "typebox/value";
import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { normalizeConf } from "./normalize";

describe("normalizeConf", () => {
  it("normalizes a full document", () => {
    const text = [
      "# globals",
      "key_mode=default",
      "env=DPI,140",
      "var=term,foot",
      "exec=waybar",
      "blur=1",
      "root_color=0x323232",
      "animation_duration_move=250",
      "circle_layout=tile,scroller",
      "exec=swaybg",
      "key_mode=resize",
      "bind=SUPER,Return,spawn,foot",
      "bindl=SUPER,L,spawn,swaylock",
      "bindc=SUPER,a,resizewin,+10,0",
      "bindc=SUPER,a,centerwin",
      "mousebind=SUPER,btn_left,killclient",
      "gesturebind=none,left,3,view,1",
      "switchbind=fold,togglefloating",
      "window_rule=app_id:firefox,tags:1|3,is_floating:1",
      "tag_rule=id:*,master_count:2",
      "key_mode=default",
    ].join("\n");

    const { config, warnings } = normalizeConf(parseConf(text));

    expect(warnings).toEqual([]);
    expect(Value.Check(schema, config)).toBe(true);
    expect(config).toEqual({
      global: {
        exec: ["waybar", "swaybg"],
        blur: true,
        root_color: "0x323232ff",
        animation_duration_move: 250,
        circle_layout: ["tile", "scroller"],
      },
      env: { DPI: "140" },
      var: { term: "foot" },
      bind: {
        resize: {
          "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }],
          lock: { "SUPER+L": [{ dispatcher: "spawn", args: "swaylock" }] },
          conflict: {
            "SUPER+a": [{ dispatcher: "resizewin", args: "+10,0" }, { dispatcher: "centerwin" }],
          },
        },
      },
      mousebind: { resize: { "SUPER+btn_left": [{ dispatcher: "killclient" }] } },
      gesturebind: { resize: { "none+left+3": [{ dispatcher: "view", args: "1" }] } },
      switchbind: { resize: { fold: [{ dispatcher: "togglefloating" }] } },
      rule: {
        window_rule: [{ app_id: "firefox", tags: [1, 3], is_floating: true }],
        tag_rule: [{ id: "*", master_count: 2 }],
      },
    });
  });

  it("collects warnings instead of stopping", () => {
    const text = [
      "nope=1",
      "blur=maybe",
      "env=DPI",
      "var=1bad,x",
      "blur_params_saturation=1.2",
      "bind=SUPER,r,reload_config",
      "bind=SUPER,r,reload_config",
    ].join("\n");

    const { config, warnings } = normalizeConf(parseConf(text));

    expect(warnings.map((warning) => warning.message)).toEqual([
      'unknown option "nope"',
      'expected a boolean, got "maybe"',
      "expected name,value in env",
      'invalid variable name "1bad"',
      "blur_params_saturation clamped to 1",
      'duplicate binding "SUPER+r"',
    ]);

    expect(config).toEqual({
      global: { blur_params_saturation: 1 },
      bind: { default: { "SUPER+r": [{ dispatcher: "reload_config" }] } },
    });
  });

  it("keeps warnings attached to their source line", () => {
    const { warnings } = normalizeConf(parseConf("blur=1\nnope=2\n", "mango.conf"));

    expect(warnings).toEqual([
      {
        message: 'unknown option "nope"',
        at: { file: "mango.conf", line: 2 },
        severity: "warning",
        code: "unknown-option",
      },
    ]);
  });

  it("ignores comments and blank lines", () => {
    const { config, warnings } = normalizeConf(parseConf("# only comments\n\n"));

    expect(config).toEqual({});
    expect(warnings).toEqual([]);
  });
});
