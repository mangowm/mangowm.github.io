import { describe, expect, it } from "vite-plus/test";

import { validateText } from "./validate";

describe("validateText", () => {
  it("accepts a valid conf", () => {
    expect(validateText("blur = 1\n# comment\n\n", "conf")).toEqual([]);
  });

  it("reports a conf line without an assignment", () => {
    const issues = validateText("blur = 1\nthis is not valid\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 2, severity: "error", code: "syntax", key: "this" }),
    );
  });

  it("reports an unclosed conf quote", () => {
    const issues = validateText('blur = "1\n', "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "syntax" }),
    );
  });

  it("reports an oversized conf value", () => {
    const issues = validateText(`exec = ${"x".repeat(256)}\n`, "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "invalid-value" }),
    );
  });

  it("keeps warning severity and codes from normalization", () => {
    const issues = validateText("nope=1\nblur_params_saturation=1.2\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "warning", code: "unknown-option" }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ line: 2, severity: "warning", code: "clamped" }),
    );
  });

  it("reports malformed comma lists as errors", () => {
    const issues = validateText("bind = SUPER,Return\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "invalid-value" }),
    );
  });

  it("reports an unclosed toml section", () => {
    const issues = validateText("[global\nblur = true\n", "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "syntax" }),
    );
  });

  it("reports an unclosed toml array", () => {
    const issues = validateText("blur = [1, 2\n", "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "syntax" }),
    );
  });

  it("reports a missing comma in a toml array", () => {
    const issues = validateText('blur = ["a" "b"]\n', "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "syntax" }),
    );
  });

  it("accepts valid toml arrays", () => {
    const issues = validateText(
      ["[global]", "blur = true", 'source = ["a", "b"]', "", "[env]", '"DPI" = "140"'].join("\n"),
      "toml",
    );

    expect(issues).toEqual([]);
  });

  it("reports monitor rules without a matcher", () => {
    const issues = validateText("monitor_rule = width:1920,height:1080,refresh:60\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "missing-field" }),
    );
  });

  it("reports partial monitor geometry", () => {
    const issues = validateText("monitor_rule = name:DP-1,width:1920\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "conflicting-fields" }),
    );
  });

  it("reports x without y", () => {
    const issues = validateText("monitor_rule = name:DP-1,x:0\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "conflicting-fields" }),
    );
  });

  it("warns about the touchpad alias", () => {
    const issues = validateText("device_rule = type:touchpad\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "warning", code: "deprecated" }),
    );
  });

  it("reports an invalid global key binding", () => {
    const issues = validateText("window_rule = app_id:foot,global_key_binding:Super_L\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", code: "invalid-value" }),
    );
  });
});
