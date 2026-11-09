import { schema } from "./schema";
import Value from "typebox/value";
import { describe, expect, it } from "vite-plus/test";

import { formatConf, parseConf } from "./conf";
import { normalizeConf, normalizeToml } from "./normalize";
import { serializeConf } from "./serialize";
import { formatToml, parseToml, serializeToml } from "./toml";

const CONF = [
  "key_mode = default",
  "env = DPI,140",
  "var = term,foot",
  "exec = waybar",
  "blur = 1",
  "border_radius = 8",
  "root_color = 0x201b14ff",
  "animation_curve_open = 0.46,1.0,0.29,1",
  "circle_layout = tile,scroller",
  "exec_once = swaybg -i wall.png",
  "bind = SUPER,Return,spawn,foot",
  "bindl = SUPER,L,spawn,swaylock",
  "bindc = SUPER,a,resizewin,+10,0",
  "bindc = SUPER,a,centerwin",
  "mousebind = SUPER,btn_left,moveresize,curmove",
  "axisbind = SUPER,UP,viewtoleft_have_client",
  "gesturebind = none,left,3,focusdir,left",
  "switchbind = fold,spawn,external-monitor on",
  "window_rule = is_floating:1,width:800,height:900,app_id:mpv",
  "tag_rule = id:1,layout_name:tile",
  "",
].join("\n");

describe("format round-trips", () => {
  it("normalizes the conf fixture", () => {
    const { config, warnings } = normalizeConf(parseConf(CONF));

    expect(warnings).toEqual([]);
    expect(Value.Check(schema, config)).toBe(true);
    expect(config.bind?.default?.["SUPER+Return"]).toEqual([{ dispatcher: "spawn", args: "foot" }]);
    expect(config.bind?.default?.conflict?.["SUPER+a"]).toEqual([
      { dispatcher: "resizewin", args: "+10,0" },
      { dispatcher: "centerwin" },
    ]);
    expect(config.global?.exec_once).toEqual(["swaybg -i wall.png"]);
    expect(config.rule?.window_rule).toEqual([
      { is_floating: true, width: 800, height: 900, app_id: "mpv" },
    ]);
  });

  it("keeps conf text stable through a document", () => {
    expect(formatConf(parseConf(CONF))).toBe(CONF);
  });

  it("round-trips conf through canonical", () => {
    const { config } = normalizeConf(parseConf(CONF));
    const { config: again, warnings } = normalizeConf(parseConf(serializeConf(config)));

    expect(warnings).toEqual([]);
    expect(again).toEqual(config);
  });

  it("round-trips toml through canonical", () => {
    const { config } = normalizeConf(parseConf(CONF));
    const { config: again, warnings } = normalizeToml(parseToml(serializeToml(config)));

    expect(warnings).toEqual([]);
    expect(again).toEqual(config);
  });

  it("converts conf to toml and back to the same canonical config", () => {
    const { config } = normalizeConf(parseConf(CONF));
    const toml = serializeToml(config);
    const { config: again, warnings } = normalizeToml(parseToml(toml));

    expect(warnings).toEqual([]);
    expect(again).toEqual(config);
    expect(Value.Check(schema, again)).toBe(true);
  });

  it("converts toml to conf and back to the same canonical config", () => {
    const { config } = normalizeToml(
      parseToml(serializeToml(normalizeConf(parseConf(CONF)).config)),
    );
    const conf = serializeConf(config);
    const { config: again, warnings } = normalizeConf(parseConf(conf));

    expect(warnings).toEqual([]);
    expect(again).toEqual(config);
  });

  it("keeps toml text stable through a document", () => {
    const text = serializeToml(normalizeConf(parseConf(CONF)).config);

    expect(formatToml(parseToml(text))).toBe(text);
  });
});
