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
});
