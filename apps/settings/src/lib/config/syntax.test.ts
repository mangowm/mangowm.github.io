import { describe, expect, it } from "vite-plus/test";

import { validateText } from "./syntax";

describe("validateText", () => {
  it("reports a conf line without an assignment", () => {
    const issues = validateText("blur = 1\nthis is not valid\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 2, severity: "error", key: "this" }),
    );
  });

  it("reports an incomplete toml line", () => {
    const issues = validateText("[global]\nblur = true\nnot valid\n", "toml");

    expect(issues).toContainEqual(expect.objectContaining({ line: 3, severity: "error" }));
  });

  it("does not flag a valid config", () => {
    expect(validateText("blur = 1\n# comment\n\n", "conf")).toEqual([]);
  });

  it("reports an unclosed quote in conf", () => {
    const issues = validateText('blur = "1\n', "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({
        line: 1,
        severity: "error",
        message: expect.stringContaining("quote"),
      }),
    );
  });

  it("reports a malformed comma list in conf", () => {
    const issues = validateText("bind = SUPER,Return\n", "conf");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", key: "bind" }),
    );
  });

  it("reports an unclosed toml section", () => {
    const issues = validateText("[global\nblur = true\n", "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({
        line: 1,
        severity: "error",
        message: expect.stringContaining("section"),
      }),
    );
  });

  it("reports an unclosed toml array", () => {
    const issues = validateText("blur = [1, 2\n", "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({
        line: 1,
        severity: "error",
        message: expect.stringContaining("array"),
      }),
    );
  });

  it("reports a missing comma in a toml array", () => {
    const issues = validateText('blur = ["a" "b"]\n', "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({
        line: 1,
        severity: "error",
        message: expect.stringContaining("comma"),
      }),
    );
  });

  it("reports an unclosed toml string", () => {
    const issues = validateText('blur = "unterminated\n', "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({
        line: 1,
        severity: "error",
        message: expect.stringContaining("quote"),
      }),
    );
  });

  it("reports a stray toml bracket", () => {
    const issues = validateText("blur = true]\n", "toml");

    expect(issues).toContainEqual(
      expect.objectContaining({ line: 1, severity: "error", message: "Unexpected ]." }),
    );
  });

  it("does not flag valid toml arrays", () => {
    expect(
      validateText(
        ["[global]", "blur = true", 'source = ["a", "b"]', "", "[env]", '"DPI" = "140"'].join("\n"),
        "toml",
      ),
    ).toEqual([]);
  });

  it("does not flag multi-line or nested arrays", () => {
    const issues = validateText(
      ["[global]", "source = [", '  "a",', '  "b",', "]", "curve = [[1, 2], [3, 4]]"].join("\n"),
      "toml",
    );

    expect(issues.filter((issue) => issue.message.includes("array"))).toEqual([]);
  });
});
