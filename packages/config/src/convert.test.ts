import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { convertDocument } from "./convert";

describe("convertDocument", () => {
  it("keeps placed comments when converting to toml", () => {
    const toml = convertDocument(parseConf("# header\nblur = 1 # note\nenv = DPI,140\n"), "toml");

    expect(toml).toContain("# header");
    expect(toml).toContain("blur = true # note");
    expect(toml).toContain('"DPI" = "140"');
  });

  it("keeps the native document unchanged", () => {
    const text = "blur = 1 # note\n";
    expect(convertDocument(parseConf(text), "conf")).toBe(text);
  });
});
