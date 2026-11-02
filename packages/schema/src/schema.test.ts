import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import Value from "typebox/value";

import { DISPATCHER_ARGS, type DispatcherArgKind } from "./data/dispatcherArgs";
import { DISPATCHERS } from "./data/dispatchers";
import { GLOBALS } from "./data/globals";
import { RULES } from "./data/rules";
import { schema, tomlSchema } from "./schema";
import { MANGO_VERSION } from "./version";

const exportedSchema = JSON.parse(
  readFileSync(new URL(`../schemas/${MANGO_VERSION}/schema.json`, import.meta.url), "utf8"),
);

const exportedTomlSchema = JSON.parse(
  readFileSync(new URL(`../schemas/${MANGO_VERSION}/toml.schema.json`, import.meta.url), "utf8"),
);

const canonicalConfig = {
  global: {
    animations: true,
    gap_inner_horizontal: 5,
    animation_type_open: "slide",
    root_color: "0x323232ff",
    exec: ["waybar"],
  },
  env: { QT_IM_MODULE: "fcitx", DPI: "140" },
  var: { term: "foot" },
  bind: {
    default: {
      "SUPER+r": [{ dispatcher: "reload_config" }],
      "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }],
      lock: { "CTRL+comma": [{ dispatcher: "spawn", args: "brightnessctl set 10%+" }] },
      release: { conflict: { "SUPER+x": [{ dispatcher: "reload_config" }] } },
    },
  },
  rule: {
    monitor_rule: [{ name: "eDP-1", width: 1920, height: 1080, refresh: 60, x: 0, y: 0 }],
  },
};

describe("canonical schema", () => {
  it("uses the expected dialect and URL", () => {
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe(`https://mangowm.github.io/schema/${MANGO_VERSION}/schema.json`);
  });

  it("matches the published snapshot", () => {
    expect(exportedSchema).toEqual(schema);
  });

  it("exposes every global option", () => {
    const global = schema.properties.global as {
      properties: Record<string, unknown>;
    };
    const keys = Object.keys(global.properties);
    expect(keys).toHaveLength(244);
    expect(
      keys.filter((key) => !["exec", "exec_once", "source", "source_optional"].includes(key)),
    ).toHaveLength(240);
  });

  it("has six rule types and 165 fields", () => {
    const rules = (schema.properties.rule as { properties: Record<string, any> }).properties;
    expect(Object.keys(rules)).toHaveLength(6);
    expect(RULES.reduce((count, rule) => count + rule.fields.length, 0)).toBe(165);
  });

  it("validates every global default", () => {
    const defaults = Object.fromEntries(
      GLOBALS.filter(
        (option) =>
          !(
            (option.type === "preset" || option.type === "layout-array") &&
            option.default.length === 0
          ),
      ).map((option) => [option.key, option.default]),
    );
    expect(Value.Check(schema, { global: defaults })).toBe(true);
    expect(Value.Check(tomlSchema, { global: defaults })).toBe(true);
  });

  it("validates a canonical config object", () => {
    expect(Value.Check(schema, canonicalConfig)).toBe(true);
  });

  it("accepts an optional canonical $schema key", () => {
    const url = `https://mangowm.github.io/schema/${MANGO_VERSION}/schema.json`;
    expect(Value.Check(schema, { $schema: url, global: { animations: true } })).toBe(true);
    expect(Value.Check(schema, { $schema: "https://example.com/schema.json" })).toBe(false);
    expect(Value.Check(tomlSchema, { $schema: url })).toBe(false);
  });

  it("rejects raw TOML forms", () => {
    expect(Value.Check(schema, { global: { blur: 1 } })).toBe(false);
    expect(Value.Check(schema, { global: { root_color: 0x323232ff } })).toBe(false);
    expect(Value.Check(schema, { env: { DPI: 140 } })).toBe(false);
    expect(Value.Check(schema, { var: { FLAG: true } })).toBe(false);
    expect(Value.Check(schema, { global: { exec: "waybar" } })).toBe(false);
    expect(Value.Check(schema, { bind: { default: { "SUPER+r": "reload_config" } } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: "1|2" }] } })).toBe(false);
    expect(Value.Check(schema, { global: { animation_curve_open: "0.46,1,0.29,1" } })).toBe(false);
    expect(Value.Check(schema, { global: { scroller_proportion_preset: "0.5,0.9" } })).toBe(false);
    expect(Value.Check(schema, { global: { circle_layout: "tile,scroller" } })).toBe(false);
  });

  it("accepts a .conf-derived canonical object", () => {
    expect(
      Value.Check(schema, {
        global: {
          blur: false,
          root_color: "0x323232ff",
          animation_curve_open: [0.46, 1, 0.29, 1],
          exec_once: ["waybar"],
          source: ["./extra.conf"],
        },
        env: { QT_IM_MODULE: "fcitx" },
        bind: { default: { "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }] } },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }], window_rule: [{ tags: [1, 2] }] },
      }),
    ).toBe(true);
  });

  it("rejects a monitor rule without a match field", () => {
    expect(Value.Check(schema, { rule: { monitor_rule: [{ scale: 1 }] } })).toBe(false);
  });

  it("enforces monitor rule groups", () => {
    expect(Value.Check(schema, { rule: { monitor_rule: [{ name: "eDP-1", width: 1920 }] } })).toBe(
      false,
    );
    expect(Value.Check(schema, { rule: { monitor_rule: [{ name: "eDP-1", x: 0 }] } })).toBe(false);
  });

  it("rejects unknown rule fields", () => {
    expect(
      Value.Check(schema, { rule: { window_rule: [{ app_id: "foot", not_a_rule: true }] } }),
    ).toBe(false);
  });

  it("validates binding trigger keys per section", () => {
    const canonicalBinding = (section: string, key: string) =>
      Value.Check(schema, {
        [section]: { default: { [key]: [{ dispatcher: "reload_config" }] } },
      });

    const valid: [string, string][] = [
      ["bind", "SUPER+r"],
      ["bind", "ctrl+alt+shift+F1"],
      ["bind", "none+XF86AudioMute"],
      ["bind", "SUPER+code:24"],
      ["bind", "super_l+UA1B2"],
      ["bind", "$mod+r"],
      ["mousebind", "SUPER+btn_left"],
      ["mousebind", "none+code:272"],
      ["axisbind", "SUPER+UP"],
      ["axisbind", "ctrl+left"],
      ["gesturebind", "none+left+3"],
      ["gesturebind", "SUPER+right+4"],
      ["switchbind", "fold"],
      ["switchbind", "unfold"],
    ];
    for (const [section, key] of valid) expect(canonicalBinding(section, key)).toBe(true);

    const invalid: [string, string][] = [
      ["bind", "SUPER+"],
      ["bind", "SUPER++r"],
      ["bind", "sideways+SUPER"],
      ["bind", "sym"],
      ["bind", "pass"],
      ["mousebind", "SUPER+btn_nope"],
      ["mousebind", "SUPER+left"],
      ["axisbind", "SUPER+sideways"],
      ["axisbind", "SUPER+btn_left"],
      ["gesturebind", "none+left"],
      ["gesturebind", "none+left+3+4"],
      ["gesturebind", "none+left+x"],
      ["switchbind", "SUPER+fold"],
      ["switchbind", "fold+unfold"],
    ];
    for (const [section, key] of invalid) expect(canonicalBinding(section, key)).toBe(false);
  });

  it("validates dispatcher arguments", () => {
    const canonical = (action: object) =>
      Value.Check(schema, { bind: { default: { "SUPER+r": [action] } } });
    const toml = (action: string) =>
      Value.Check(tomlSchema, { bind: { default: { "SUPER+r": action } } });

    const cases: [object, string, boolean][] = [
      [{ dispatcher: "reload_config" }, "reload_config", true],
      [{ dispatcher: "reload_config", args: "x" }, "reload_config,x", false],
      [{ dispatcher: "focusdir", args: "left" }, "focusdir,left", true],
      [{ dispatcher: "focusdir", args: "sideways" }, "focusdir,sideways", false],
      [{ dispatcher: "focusdir" }, "focusdir", true],
      [{ dispatcher: "tag", args: "1|3,1" }, "tag,1|3,1", true],
      [{ dispatcher: "tag", args: "99" }, "tag,99", false],
      [{ dispatcher: "view", args: "1,2" }, "view,1,2", false],
      [{ dispatcher: "spawn", args: 'sh -c "echo a,b"' }, 'spawn,sh -c "echo a,b"', true],
      [{ dispatcher: "movewin", args: "+10,-5" }, "movewin,+10,-5", true],
      [{ dispatcher: "movewin", args: "a,b" }, "movewin,a,b", false],
      [{ dispatcher: "togglehdr", args: "on,eDP-1" }, "togglehdr,on,eDP-1", true],
      [{ dispatcher: "togglehdr", args: "eDP-1" }, "togglehdr,eDP-1", false],
      [{ dispatcher: "moveresize", args: "curnormal" }, "moveresize,curnormal", true],
      [{ dispatcher: "setlayout", args: "scroller" }, "setlayout,scroller", true],
      [{ dispatcher: "setlayout", args: "foo" }, "setlayout,foo", false],
      [{ dispatcher: "focusmon", args: "next" }, "focusmon,next", true],
      [{ dispatcher: "focusmon", args: "left" }, "focusmon,left", true],
      [{ dispatcher: "focusmon", args: "eDP-1" }, "focusmon,eDP-1", true],
      [
        { dispatcher: "focusmon", args: "make:Chimei Innolux Corporation&&model:0x15F5" },
        "focusmon,make:Chimei Innolux Corporation&&model:0x15F5",
        true,
      ],
      [{ dispatcher: "focusmon", args: "foo:bar" }, "focusmon,foo:bar", false],
      [{ dispatcher: "disable_monitor", args: "name:" }, "disable_monitor,name:", false],
      [
        { dispatcher: "disable_monitor", args: "name:eDP-1&&" },
        "disable_monitor,name:eDP-1&&",
        false,
      ],
      [{ dispatcher: "disable_monitor", args: "eDP-1" }, "disable_monitor,eDP-1", true],
      [{ dispatcher: "view_insert", args: "next" }, "view_insert,next", true],
      [{ dispatcher: "view_insert", args: "sideways" }, "view_insert,sideways", false],
      [{ dispatcher: "switch_keyboard_layout", args: "2" }, "switch_keyboard_layout,2", true],
      [{ dispatcher: "switch_keyboard_layout", args: "+2" }, "switch_keyboard_layout,+2", true],
      [{ dispatcher: "switch_keyboard_layout", args: "foo" }, "switch_keyboard_layout,foo", false],
      [{ dispatcher: "setmfact", args: "1e-2" }, "setmfact,1e-2", true],
      [{ dispatcher: "setmfact", args: "abc" }, "setmfact,abc", false],
      [{ dispatcher: "set_proportion", args: "0.5" }, "set_proportion,0.5", true],
      [{ dispatcher: "set_proportion", args: "1.5" }, "set_proportion,1.5", false],
      [{ dispatcher: "switch_keyboard_layout", args: "101" }, "switch_keyboard_layout,101", false],
      [{ dispatcher: "killclient", args: "force" }, "killclient,force", true],
      [{ dispatcher: "killclient", args: "maybe" }, "killclient,maybe", false],
      [{ dispatcher: "setoption", args: "blur,1,2" }, "setoption,blur,1,2", true],
      [
        { dispatcher: "setoption", args: "blur_params_radius,3" },
        "setoption,blur_params_radius,3",
        true,
      ],
      [{ dispatcher: "setoption", args: "not_an_option,1" }, "setoption,not_an_option,1", false],
      [{ dispatcher: "setoption", args: "blur" }, "setoption,blur", true],
      [
        { dispatcher: "toggle_named_scratchpad", args: "a,none,cmd" },
        "toggle_named_scratchpad,a,none,cmd",
        true,
      ],
      [
        { dispatcher: "toggle_named_scratchpad", args: "a,none,cmd,extra" },
        "toggle_named_scratchpad,a,none,cmd,extra",
        false,
      ],
    ];

    for (const [action, string, expected] of cases) {
      expect(canonical(action)).toBe(expected);
      expect(toml(string)).toBe(expected);
    }
  });

  it("accepts variable and empty-argument actions", () => {
    expect(
      Value.Check(tomlSchema, {
        bind: {
          default: {
            "SUPER+a": "$term",
            "SUPER+b": "${term},--hold",
            "SUPER+c": "reload_config,",
            "SUPER+d": "toggleglobal,0",
            "SUPER+e": "killclient,",
            "SUPER+f": "view,1,",
          },
        },
      }),
    ).toBe(true);
  });

  it("accepts variable references in typed values", () => {
    const vars = {
      var: {
        n: "1",
        f: "0.5",
        b: "1",
        color: "0x112233ff",
        anim: "slide",
        curve: "0.46,1,0.29,1",
        layout: "tile",
        mask: "1|2",
        dir: "left",
        opt: "blur",
        mon: "eDP-1",
      },
    };

    expect(
      Value.Check(schema, {
        ...vars,
        global: {
          border_radius: "$n",
          zoom_initial_ratio: "$f",
          animations: "$b",
          root_color: "$color",
          animation_type_open: "$anim",
          animation_curve_open: "$curve",
          circle_layout: "$layout",
        },
        rule: {
          monitor_rule: [
            {
              name: "eDP-1",
              scale: "$f",
              width: "$n",
              height: "$n",
              refresh: "$f",
              custom: "$b",
            },
          ],
          tag_rule: [{ id: "$n", master_count: "$n", layout_name: "$layout" }],
          window_rule: [
            { width: "$f", is_floating: "$b", animation_type_open: "$anim", tags: "$mask" },
          ],
        },
        bind: {
          default: {
            "SUPER+r": [{ dispatcher: "focusdir", args: "$dir" }],
            "SUPER+s": [{ dispatcher: "setoption", args: "$opt,1" }],
            "SUPER+t": [{ dispatcher: "setlayout", args: "$layout" }],
            "SUPER+u": [{ dispatcher: "movewin", args: "$n,$n" }],
            "SUPER+v": [{ dispatcher: "view", args: "$mask" }],
            "SUPER+w": [{ dispatcher: "focusmon", args: "$mon&&make:BOE" }],
          },
        },
      }),
    ).toBe(true);

    expect(
      Value.Check(tomlSchema, {
        ...vars,
        global: {
          border_radius: "$n",
          animations: "$b",
          root_color: "$color",
          animation_curve_open: "$curve",
          circle_layout: "$layout",
        },
        rule: {
          monitor_rule: [
            {
              name: "eDP-1",
              scale: "$f",
              width: "$n",
              height: "$n",
              refresh: "$f",
              custom: "$b",
            },
          ],
          tag_rule: [{ id: "$n", master_count: "$n", layout_name: "$layout" }],
          window_rule: [{ width: "$f", is_floating: "$b", tags: "$mask" }],
        },
        bind: {
          default: {
            "SUPER+r": "focusdir,$dir",
            "SUPER+s": "setoption,$opt,1",
            "SUPER+t": "setlayout,$layout",
            "SUPER+u": "movewin,$n,$n",
            "SUPER+v": "view,$mask",
            "SUPER+w": "focusmon,$mon&&make:BOE",
          },
        },
      }),
    ).toBe(true);

    expect(Value.Check(schema, { global: { border_radius: "$1bad" } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { border_radius: "$1bad" } })).toBe(false);
  });

  it("rejects extra arguments on no-argument dispatchers", () => {
    expect(Value.Check(tomlSchema, { bind: { default: { "SUPER+r": "reload_config,foo" } } })).toBe(
      false,
    );
    expect(
      Value.Check(schema, {
        bind: { default: { "SUPER+r": [{ dispatcher: "reload_config", args: "foo" }] } },
      }),
    ).toBe(false);
  });

  it("accepts every dispatcher name", () => {
    const bind = Object.fromEntries(
      DISPATCHERS.map((dispatcher, index) => [`SUPER+F${index}`, [{ dispatcher }]]),
    );
    expect(Value.Check(schema, { bind: { default: bind } })).toBe(true);
  });

  it("validates every dispatcher with sample arguments", () => {
    const samples: Record<DispatcherArgKind, string> = {
      direction: "left",
      circle: "next",
      overcircle: "current_next",
      int: "+1",
      float: "+0.5",
      bool: "1",
      "tag-mask": "1|3",
      layout: "scroller",
      monitor: "eDP-1",
      option: "blur",
      string: "foo",
      free: "echo hi",
      "mouse-action": "curmove",
      force: "force",
      switcher: "all_next",
      "on-off": "on",
      "prev-next": "next",
      index100: "2",
      "unit-float": "0.5",
    };

    expect(Object.keys(DISPATCHER_ARGS)).toHaveLength(DISPATCHERS.length);

    for (const dispatcher of DISPATCHERS) {
      const args = DISPATCHER_ARGS[dispatcher].map((kind) => samples[kind]);
      const string = args.length === 0 ? dispatcher : `${dispatcher},${args.join(",")}`;
      const action = args.length === 0 ? { dispatcher } : { dispatcher, args: args.join(",") };
      expect(Value.Check(tomlSchema, { bind: { default: { "SUPER+r": string } } })).toBe(true);
      expect(Value.Check(schema, { bind: { default: { "SUPER+r": [action] } } })).toBe(true);
    }
  });

  it("rejects unknown dispatchers", () => {
    expect(
      Value.Check(schema, { bind: { default: { "SUPER+r": [{ dispatcher: "reload_confg" }] } } }),
    ).toBe(false);
    expect(
      Value.Check(schema, {
        bind: { default: { lock: { "SUPER+r": [{ dispatcher: "reload_confg" }] } } },
      }),
    ).toBe(false);
  });

  it("accepts action objects", () => {
    expect(
      Value.Check(schema, {
        bind: {
          default: {
            "SUPER+r": [{ dispatcher: "reload_config" }],
            "SUPER+t": [{ variable: "term" }],
            "SUPER+s": [{ dispatcher: "spawn", args: "foot" }],
            "SUPER+v": [{ variable: "term", args: "--hold" }],
          },
        },
      }),
    ).toBe(true);
    expect(
      Value.Check(schema, {
        bind: { default: { "SUPER+r": [{ dispatcher: "reload_config", variable: "x" }] } },
      }),
    ).toBe(false);
    expect(Value.Check(schema, { bind: { default: { "SUPER+r": [{ args: "x" }] } } })).toBe(false);
  });

  it("enforces canonical action arrays", () => {
    const actions = [{ dispatcher: "spawn", args: "a" }, { dispatcher: "reload_config" }];
    const keys: Record<string, string> = {
      bind: "SUPER+r",
      mousebind: "SUPER+btn_left",
      axisbind: "SUPER+UP",
      gesturebind: "none+left+3",
      switchbind: "fold",
    };
    for (const [section, key] of Object.entries(keys)) {
      expect(Value.Check(schema, { [section]: { default: { [key]: actions } } })).toBe(false);
      expect(
        Value.Check(schema, { [section]: { default: { conflict: { [key]: actions } } } }),
      ).toBe(section === "bind");
    }
    expect(
      Value.Check(schema, {
        bind: {
          default: {
            release: { conflict: { "SUPER+r": actions } },
            pass: { conflict: { "SUPER+r": actions } },
          },
        },
      }),
    ).toBe(true);
  });

  it("accepts uppercase hex colors", () => {
    expect(Value.Check(schema, { global: { root_color: "0X323232FF" } })).toBe(true);
  });

  it("bounds saturation", () => {
    expect(Value.Check(schema, { global: { blur_params_saturation: 1 } })).toBe(true);
    expect(Value.Check(schema, { global: { blur_params_saturation: 1.2 } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { blur_params_saturation: 1.2 } })).toBe(false);
  });

  it("accepts an empty animation type", () => {
    expect(Value.Check(schema, { rule: { window_rule: [{ animation_type_open: "" }] } })).toBe(
      true,
    );
  });

  it("accepts flags, numeric tag ids, and layout lists", () => {
    expect(
      Value.Check(schema, {
        global: { circle_layout: ["tile", "scroller"] },
        bind: {
          default: {
            release: { conflict: { "SUPER+r": [{ dispatcher: "reload_config" }] } },
          },
        },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }] },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { global: { circle_layout: ["not_a_layout"] } })).toBe(false);
  });

  it("validates tag ids and tag arrays", () => {
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "*" }, { id: 1 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "abc" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "99" }] } })).toBe(false);
    expect(
      Value.Check(schema, {
        rule: { window_rule: [{ tags: [1, 2] }, { tags: [0] }, { tags: [5] }] },
      }),
    ).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ tags: 5 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [0, 1] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [1, 1] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [1, 32] }] } })).toBe(false);
  });

  it("normalizes canonical rule booleans and tag masks", () => {
    for (const value of [true, false]) {
      expect(Value.Check(schema, { rule: { window_rule: [{ is_floating: value }] } })).toBe(true);
    }
    for (const value of [0, 1, -1]) {
      expect(Value.Check(schema, { rule: { window_rule: [{ is_floating: value }] } })).toBe(false);
    }
    for (const value of [true, false, 0, 1, -1]) {
      expect(Value.Check(tomlSchema, { rule: { window_rule: [{ is_floating: value }] } })).toBe(
        true,
      );
    }

    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ tags: -1 }] } })).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ tags: "-1" }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: -1 }] } })).toBe(false);
    expect(
      Value.Check(schema, {
        rule: {
          window_rule: [{ tags: Array.from({ length: 31 }, (_, index) => index + 1) }],
        },
      }),
    ).toBe(true);
  });

  it("tightens array bounds", () => {
    expect(Value.Check(schema, { global: { animation_curve_open: [-0.1, 0, 1, 1] } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { animation_curve_open: [-0.1, 0, 1, 1] } })).toBe(
      false,
    );
    expect(Value.Check(schema, { global: { scroller_proportion_preset: [] } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { scroller_proportion_preset: [] } })).toBe(false);
    expect(Value.Check(schema, { global: { circle_layout: [] } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { circle_layout: [] } })).toBe(false);
  });

  it("validates global key bindings", () => {
    expect(
      Value.Check(schema, {
        rule: {
          window_rule: [
            { global_key_binding: "SUPER-XF86AudioMute" },
            { global_key_binding: "ctrl+alt-o" },
            { global_key_binding: "SUPER - XF86AudioMute" },
            { global_key_binding: "$mod-o" },
            { global_key_binding: "SUPER-code:24" },
          ],
        },
      }),
    ).toBe(true);
    expect(
      Value.Check(tomlSchema, {
        rule: {
          window_rule: [
            { global_key_binding: "SUPER-XF86AudioMute" },
            { global_key_binding: "ctrl+alt-o" },
          ],
        },
      }),
    ).toBe(true);
    for (const global_key_binding of [
      "SUPER",
      "SUPER - XF86AudioMute extra",
      "SUPER-",
      "-r",
      "nope-r",
      "SUPER+r",
    ]) {
      expect(Value.Check(schema, { rule: { window_rule: [{ global_key_binding }] } })).toBe(false);
      expect(Value.Check(tomlSchema, { rule: { window_rule: [{ global_key_binding }] } })).toBe(
        false,
      );
    }
  });

  it("constrains device rule names", () => {
    expect(
      Value.Check(schema, {
        rule: {
          device_rule: [
            { name: "AT Translated Set 2 keyboard" },
            { name: "1:2:AT Translated Set 2 keyboard" },
          ],
        },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { rule: { device_rule: [{ name: "a,b" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { device_rule: [{ name: "" }] } })).toBe(false);
    expect(Value.Check(tomlSchema, { rule: { device_rule: [{ name: "a,b" }] } })).toBe(false);
  });

  it("constrains env and var names", () => {
    expect(Value.Check(schema, { env: { "": "x" } })).toBe(false);
    expect(Value.Check(schema, { var: { "1bad": "x" } })).toBe(false);
    expect(
      Value.Check(schema, {
        env: { QT_IM_MODULE: "fcitx" },
        var: { term: "foot" },
      }),
    ).toBe(true);
    expect(Value.Check(tomlSchema, { env: { "": "x" } })).toBe(false);
  });

  it("rejects commas in rule strings", () => {
    const rules = [
      { window_rule: [{ title: "a,b" }] },
      { window_rule: [{ app_id: "a,b" }] },
      { window_rule: [{ monitor: "name:a,b" }] },
      { monitor_rule: [{ name: "a,b" }] },
      { monitor_rule: [{ make: "a,b" }] },
      { layer_rule: [{ layer_name: "a,b" }] },
      { device_rule: [{ kb_layout: "us,ru" }] },
    ];
    for (const rule of rules) {
      expect(Value.Check(schema, { rule })).toBe(false);
      expect(Value.Check(tomlSchema, { rule })).toBe(false);
    }
    expect(Value.Check(schema, { rule: { window_rule: [{ title: "^a.b$" }] } })).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ title: "^a.b$" }] } })).toBe(true);
  });

  it("rejects empty directives and env values", () => {
    for (const value of [
      { global: { exec: [""] } },
      { global: { exec: "" } },
      { global: { exec_once: [""] } },
      { global: { source: [""] } },
      { global: { source_optional: [""] } },
      { env: { EMPTY: "" } },
    ]) {
      expect(Value.Check(schema, value)).toBe(false);
      expect(Value.Check(tomlSchema, value)).toBe(false);
    }
    expect(Value.Check(schema, { global: { exec: ["waybar"] }, env: { DPI: "140" } })).toBe(true);
    expect(Value.Check(tomlSchema, { global: { exec: "waybar" }, env: { DPI: 140 } })).toBe(true);
  });

  it("accepts TOML shadow blur fractions", () => {
    expect(Value.Check(tomlSchema, { global: { shadows_blur: 12.5 } })).toBe(true);
    expect(Value.Check(schema, { global: { shadows_blur: 12 } })).toBe(true);
    expect(Value.Check(schema, { global: { shadows_blur: 12.5 } })).toBe(false);
  });

  it("accepts device scroll options", () => {
    expect(
      Value.Check(schema, {
        rule: { device_rule: [{ scroll_button: 0 }, { scroll_button: 300 }, { scroll_method: 4 }] },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { rule: { device_rule: [{ scroll_method: 8 }] } })).toBe(false);
    expect(Value.Check(schema, { global: { mouse_scroll_method: 8 } })).toBe(false);
  });

  it("bounds window opacity and scroller proportions", () => {
    expect(Value.Check(schema, { rule: { window_rule: [{ focused_opacity: 1.5 }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ focused_opacity: 0.5 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ scroller_proportion: -0.1 }] } })).toBe(
      false,
    );
    expect(Value.Check(schema, { rule: { window_rule: [{ scroller_proportion: 0 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ scroller_proportion: 0.05 }] } })).toBe(
      true,
    );
    expect(
      Value.Check(schema, { rule: { window_rule: [{ scroller_proportion_single: 0.5 }] } }),
    ).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ unfocused_opacity: 2 }] } })).toBe(
      false,
    );
  });

  it("accepts tearing overrides", () => {
    expect(Value.Check(schema, { rule: { window_rule: [{ force_tearing: 2 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ force_tearing: 3 }] } })).toBe(false);
  });

  it("rejects unknown global options", () => {
    expect(Value.Check(schema, { global: { not_an_option: true } })).toBe(false);
  });

  it("rejects wrong value types", () => {
    expect(Value.Check(schema, { global: { animations: "yes" } })).toBe(false);
  });
});

describe("TOML schema", () => {
  it("uses the expected dialect and URL", () => {
    expect(tomlSchema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(tomlSchema.$id).toBe(
      `https://mangowm.github.io/schema/${MANGO_VERSION}/toml.schema.json`,
    );
  });

  it("matches the published snapshot", () => {
    expect(exportedTomlSchema).toEqual(tomlSchema);
  });

  it("accepts raw TOML forms", () => {
    expect(
      Value.Check(tomlSchema, {
        global: {
          blur: 0,
          root_color: 0x323232ff,
          exec: "waybar",
          source: "./extra.toml",
          animation_curve_open: "0.46,1,0.29,1",
          scroller_proportion_preset: "0.5,0.9",
          circle_layout: "tile,scroller",
        },
        env: { DPI: 140, FLAG: true },
        var: { scale: 1.5 },
        bind: {
          default: {
            "SUPER+r": "reload_config",
            "SUPER+Return": ["spawn,foot"],
            "SUPER+x": "spawn , foot",
          },
        },
        rule: { window_rule: [{ is_floating: 1, width: 0.5, tags: "1 | 2" }] },
      }),
    ).toBe(true);
  });

  it("accepts all binding sections and source_optional", () => {
    expect(
      Value.Check(tomlSchema, {
        global: { source_optional: ["a.toml"], exec_once: ["x"] },
        mousebind: { default: { "SUPER+btn_left": "moveresize,curmove" } },
        axisbind: { default: { "SUPER+UP": "viewtoleft_have_client" } },
        gesturebind: { default: { "none+left+3": "focusdir,left" } },
        switchbind: { default: { fold: "spawn,a" } },
        bind: { default: { conflict: { "SUPER+r": ["spawn,a", "reload_config"] } } },
      }),
    ).toBe(true);
  });

  it("matches lenient TOML parser forms", () => {
    expect(
      Value.Check(tomlSchema, {
        bind: {
          default: {
            lock: { sym: { "SUPER+r": "reload_config" } },
            pass: { pass: { "SUPER+t": "reload_config" } },
          },
        },
      }),
    ).toBe(true);

    expect(
      Value.Check(tomlSchema, {
        bind: {
          default: {
            conflict: { lock: { "SUPER+r": ["spawn,a", "reload_config"] } },
          },
        },
      }),
    ).toBe(true);

    expect(
      Value.Check(tomlSchema, {
        keybind: { default: { "SUPER+r": "reload_config" } },
      }),
    ).toBe(true);

    expect(
      Value.Check(tomlSchema, {
        rule: {
          monitor_rule: { name: "eDP-1" },
          window_rule: { app_id: "foot" },
        },
      }),
    ).toBe(true);

    expect(
      Value.Check(tomlSchema, {
        animations: 1,
        border_radius: 5,
        root_color: "0x323232ff",
        exec: "waybar",
        key_mode: "resize",
        env: "QT_IM_MODULE,fcitx",
        var: "term,foot",
        bind: "SUPER,r,reload_config",
        monitor_rule: "name:eDP-1",
      }),
    ).toBe(true);

    expect(Value.Check(tomlSchema, { monitor_rule: { name: "eDP-1" } })).toBe(true);
    expect(Value.Check(tomlSchema, { monitor_rule: [{ name: "eDP-1" }] })).toBe(true);
    expect(
      Value.Check(tomlSchema, {
        binds: "SUPER,r,reload_config",
        bindl: "SUPER,r,reload_config",
        mousebindc: "SUPER,btn_left,moveresize,curmove",
      }),
    ).toBe(true);
    expect(
      Value.Check(tomlSchema, {
        global: { binds: "SUPER,r,reload_config" },
      }),
    ).toBe(true);
  });

  it("validates binding trigger keys per section", () => {
    const tomlBinding = (section: string, key: string) =>
      Value.Check(tomlSchema, { [section]: { default: { [key]: "reload_config" } } });

    const valid: [string, string][] = [
      ["bind", "SUPER+r"],
      ["bind", "CTRL+ALT+shift+F1"],
      ["bind", "none+XF86AudioMute"],
      ["bind", "SUPER+code:24"],
      ["bind", "$mod+r"],
      ["mousebind", "SUPER+btn_left"],
      ["mousebind", "none+code:272"],
      ["axisbind", "SUPER+UP"],
      ["axisbind", "ctrl+left"],
      ["gesturebind", "none+left+3"],
      ["gesturebind", "SUPER+right+4"],
      ["switchbind", "fold"],
      ["switchbind", "unfold"],
    ];
    for (const [section, key] of valid) expect(tomlBinding(section, key)).toBe(true);

    const invalid: [string, string][] = [
      ["bind", "SUPER+"],
      ["bind", "SUPER++r"],
      ["bind", "sym"],
      ["bind", "lock"],
      ["mousebind", "SUPER+btn_nope"],
      ["mousebind", "SUPER+left"],
      ["axisbind", "SUPER+sideways"],
      ["axisbind", "SUPER+btn_left"],
      ["gesturebind", "none+left"],
      ["gesturebind", "none+left+3+4"],
      ["switchbind", "SUPER+fold"],
      ["switchbind", "fold+unfold"],
    ];
    for (const [section, key] of invalid) expect(tomlBinding(section, key)).toBe(false);
  });

  it("rejects bare modifier names as keys", () => {
    for (const key of ["super", "ctrl", "shift", "alt", "hyper", "none", "SUPER"]) {
      expect(
        Value.Check(schema, { bind: { default: { [key]: [{ dispatcher: "reload_config" }] } } }),
      ).toBe(false);
      expect(Value.Check(tomlSchema, { bind: { default: { [key]: "reload_config" } } })).toBe(
        false,
      );
    }

    expect(
      Value.Check(schema, { bind: { default: { super_l: [{ dispatcher: "reload_config" }] } } }),
    ).toBe(true);
    expect(
      Value.Check(schema, {
        bind: { default: { "SUPER+super_l": [{ dispatcher: "reload_config" }] } },
      }),
    ).toBe(true);
    expect(
      Value.Check(schema, {
        bind: { default: { "SUPER+super": [{ dispatcher: "reload_config" }] } },
      }),
    ).toBe(false);
  });

  it("accepts toml tag zero forms", () => {
    expect(
      Value.Check(tomlSchema, {
        rule: { window_rule: [{ tags: "0" }, { tags: "0|1" }, { tags: "1|2" }] },
      }),
    ).toBe(true);
  });

  it("validates toml comma strings", () => {
    expect(Value.Check(tomlSchema, { global: { animation_curve_open: "0.46,1,0.29" } })).toBe(
      false,
    );
    expect(Value.Check(tomlSchema, { global: { animation_curve_open: "a,b,c,d" } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { circle_layout: "foo" } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { scroller_proportion_preset: "a,b" } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { circle_layout: "tile, scroller" } })).toBe(true);
  });

  it("accepts a scalar proportion preset", () => {
    expect(Value.Check(tomlSchema, { global: { scroller_proportion_preset: 0.5 } })).toBe(true);
    expect(Value.Check(schema, { global: { scroller_proportion_preset: 0.5 } })).toBe(false);
  });

  it("accepts canonical scalar forms", () => {
    expect(
      Value.Check(tomlSchema, {
        global: { animations: true, root_color: "0x323232ff", exec: ["waybar"] },
        env: { DPI: "140" },
        bind: { default: { "SUPER+r": "reload_config" } },
      }),
    ).toBe(true);
  });

  it("rejects canonical actions and tag arrays", () => {
    expect(
      Value.Check(tomlSchema, {
        bind: { default: { "SUPER+r": [{ dispatcher: "reload_config" }] } },
      }),
    ).toBe(false);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ tags: [1, 2] }] } })).toBe(false);
  });

  it("enforces binding array conflict rules", () => {
    expect(
      Value.Check(tomlSchema, {
        bind: { default: { "SUPER+r": ["spawn,a", "reload_config"] } },
      }),
    ).toBe(false);
    expect(
      Value.Check(tomlSchema, {
        bind: { default: { conflict: { "SUPER+r": ["spawn,a", "reload_config"] } } },
      }),
    ).toBe(true);
    expect(
      Value.Check(tomlSchema, {
        mousebind: { default: { "SUPER+btn_left": ["spawn,a", "reload_config"] } },
      }),
    ).toBe(false);
    expect(
      Value.Check(tomlSchema, {
        mousebind: { default: { "SUPER+btn_left": ["spawn,a"] } },
      }),
    ).toBe(true);
    expect(
      Value.Check(tomlSchema, {
        mousebind: {
          default: { conflict: { "SUPER+btn_left": ["spawn,a", "reload_config"] } },
        },
      }),
    ).toBe(false);
    expect(Value.Check(tomlSchema, { bind: { default: { "SUPER+r": [] } } })).toBe(false);
  });

  it("accepts boolean force_tearing in toml", () => {
    expect(
      Value.Check(tomlSchema, {
        rule: {
          window_rule: [{ force_tearing: true }, { force_tearing: false }, { force_tearing: 2 }],
        },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ force_tearing: true }] } })).toBe(false);
  });

  it("accepts custom off as an integer", () => {
    expect(
      Value.Check(tomlSchema, { rule: { monitor_rule: [{ name: "eDP-1", custom: 0 }] } }),
    ).toBe(true);
  });

  it("accepts quoted tag ids and spaced tag masks", () => {
    expect(
      Value.Check(tomlSchema, {
        rule: {
          tag_rule: [{ id: "*" }, { id: "1" }],
          window_rule: [{ tags: "1 | 2" }],
        },
      }),
    ).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { tag_rule: [{ id: "99" }] } })).toBe(false);
  });
});
