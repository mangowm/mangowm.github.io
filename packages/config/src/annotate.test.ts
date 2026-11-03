import { describe, expect, it } from "vite-plus/test";

import { annotate } from "./annotate";
import { parseConf } from "./conf";
import { emit } from "./emit";
import { parseToml } from "./toml";

describe("annotate", () => {
  it("extracts file, leading, and inline comments", () => {
    const document = parseConf("# header\nblur = 1 # note\nenv = DPI,140\n");
    const annotated = annotate(document);

    expect(annotated.comments).toEqual([
      { text: "# header", anchor: { kind: "global", key: "blur" }, position: "before" },
      { text: "# note", anchor: { kind: "global", key: "blur" }, position: "inline" },
    ]);
  });

  it("attaches comments to the next entry", () => {
    const document = parseConf("blur = 1\n# exec note\nexec = waybar\n");
    const annotated = annotate(document);

    expect(annotated.comments).toContainEqual({
      text: "# exec note",
      anchor: { kind: "directive", key: "exec", index: 0 },
      position: "before",
    });
  });
});

describe("emit", () => {
  it("keeps comments when converting conf to toml", () => {
    const document = parseConf("# header\nblur = 1 # note\nenv = DPI,140\n");
    const toml = emit(annotate(document), "toml");

    expect(toml).toContain("# header");
    expect(toml).toContain("blur = true # note");
    expect(toml).toContain('"DPI" = "140"');
  });

  it("keeps comments when converting toml to conf", () => {
    const document = parseToml('# header\n[global]\nblur = true # note\n[env]\n"DPI" = "140"\n');
    const conf = emit(annotate(document), "conf");

    expect(conf).toContain("# header");
    expect(conf).toContain("blur = 1 # note");
    expect(conf).toContain("env = DPI,140");
  });
});
