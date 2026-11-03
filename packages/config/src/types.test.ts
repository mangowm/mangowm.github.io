import { describe, expect, it } from "vite-plus/test";

import type { CanonicalConfig } from "./types";

describe("canonical types", () => {
  it("accepts a representative config", () => {
    const config: CanonicalConfig = {
      global: { animations: true, root_color: "0x323232ff", exec: ["waybar"] },
      env: { DPI: "140" },
      bind: { default: { "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }] } },
      rule: { window_rule: [{ class: "firefox", tags: [1] }] },
    };

    expect(config.bind?.default).toBeDefined();
  });
});
