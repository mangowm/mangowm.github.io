import { describe, expect, it } from "vite-plus/test";
import { applyChange, parseConf, parseToml } from "@mangowm.github.io/config";

import { documentLines } from "./parse";
import { diffConfigFile } from "./diff";
import type { FileFormat, SourceFile } from "./types";

function sourceFile(text: string, format: FileFormat): SourceFile {
  const document = format === "toml" ? parseToml(text) : parseConf(text);
  return {
    absPath: `/tmp/config.${format}`,
    refPath: `config.${format}`,
    format,
    document,
    lines: documentLines(document),
    original: text,
  };
}

function edited(file: SourceFile, key: string, value: string): SourceFile {
  const document = applyChange(file.document, { kind: "option", key, value });
  return { ...file, document, lines: documentLines(document) };
}

describe("config diffs", () => {
  it("reports no change for an untouched file", () => {
    const file = sourceFile("border_radius = 2\n# keep me\n", "conf");
    const diff = diffConfigFile(file, "conf");

    expect(diff.changed).toBe(false);
    expect(diff.oldText).toBe(file.original);
    expect(diff.newText).toBe(file.original);
    expect(diff.name).toBe("config.conf");
    expect(diff.language).toBe("ini");
  });

  it("diffs the current native document against the on-disk text", () => {
    const file = edited(sourceFile("border_radius = 2\n# keep me\n", "conf"), "border_radius", "3");
    const diff = diffConfigFile(file, "conf");

    expect(diff.changed).toBe(true);
    expect(diff.oldText).toContain("border_radius = 2");
    expect(diff.newText).toContain("border_radius = 3");
    expect(diff.newText).toContain("# keep me");
  });

  it("renders both sides in the target format when converting", () => {
    const file = edited(sourceFile("border_radius = 2\n", "conf"), "border_radius", "3");
    const diff = diffConfigFile(file, "toml");

    expect(diff.changed).toBe(true);
    expect(diff.name).toBe("config.toml");
    expect(diff.language).toBe("toml");
    expect(diff.oldText).toContain("border_radius = 2");
    expect(diff.newText).toContain("border_radius = 3");
  });
});
