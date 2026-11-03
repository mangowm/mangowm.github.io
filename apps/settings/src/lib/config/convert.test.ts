import { describe, expect, it } from "vite-plus/test";

import { convertDocument } from "./convert";
import { parseDocument } from "./parse";

describe("config conversion", () => {
  it("applies edits made in the converted format", () => {
    const conf = parseDocument("animations = 1\n", "conf");
    const toml = convertDocument(conf, "toml");

    expect(toml).toContain("animations = true");

    const edited = toml.replace("animations = true", "animations = false");
    const back = convertDocument(parseDocument(edited, "toml"), "conf");

    expect(back).toContain("animations = 0");
  });
});
