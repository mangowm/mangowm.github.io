import { describe, expect, it } from "vite-plus/test";

import { formatConf, parseConf } from "../conf";
import { formatToml, parseToml } from "../toml";
import { applyMigrations, detectMigrations } from "./registry";

describe("switch state migration", () => {
  it("renames fold and unfold in conf and keeps formatting", () => {
    const text = [
      "# lid bindings",
      "switchbind=fold,spawn,swaylock # close",
      "key_mode=secondary",
      "switchbind = unfold , spawn , foo",
    ].join("\n");

    const document = parseConf(text);
    const original = formatConf(document);
    const findings = detectMigrations(document);

    expect(findings.map((finding) => [finding.line, finding.before, finding.after])).toEqual([
      [2, "fold", "lid_on"],
      [4, "unfold", "lid_off"],
    ]);
    expect(findings.every((finding) => finding.fixable)).toBe(true);

    const result = applyMigrations(document);
    expect(formatConf(document)).toBe(original);
    expect(formatConf(result.document)).toBe(
      [
        "# lid bindings",
        "switchbind=lid_on,spawn,swaylock # close",
        "key_mode=secondary",
        "switchbind = lid_off , spawn , foo",
      ].join("\n"),
    );
    expect(result.applied).toHaveLength(2);
    expect(result.remaining).toEqual([]);
  });

  it("renames quoted TOML keys", () => {
    const text = ["[switchbind.default]", '"fold" = "spawn,swaylock"', 'unfold = "spawn,foo"'].join(
      "\n",
    );

    const document = parseToml(text);
    const result = applyMigrations(document);

    expect(formatToml(result.document)).toBe(
      ["[switchbind.default]", '"lid_on" = "spawn,swaylock"', 'lid_off = "spawn,foo"'].join("\n"),
    );
    expect(detectMigrations(result.document)).toEqual([]);
  });

  it("is idempotent", () => {
    const document = parseConf("switchbind=fold,spawn,swaylock\n");
    const once = applyMigrations(document);
    const twice = applyMigrations(once.document);

    expect(formatConf(twice.document)).toBe(formatConf(once.document));
    expect(twice.applied).toEqual([]);
  });

  it("preserves CRLF", () => {
    const result = applyMigrations(parseConf("switchbind=fold,spawn,swaylock\r\n"));

    expect(formatConf(result.document)).toBe("switchbind=lid_on,spawn,swaylock\r\n");
  });

  it("leaves conflicting modes for manual resolution", () => {
    const text = ["switchbind=fold,spawn,a", "switchbind=lid_on,spawn,b"].join("\n");

    const document = parseConf(text);
    const findings = detectMigrations(document);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.fixable).toBe(false);

    const result = applyMigrations(document);
    expect(formatConf(result.document)).toBe(text);
    expect(result.applied).toEqual([]);
    expect(result.remaining).toHaveLength(1);
  });

  it("fixes the same state in different key modes", () => {
    const text = [
      "switchbind=fold,spawn,a",
      "key_mode=secondary",
      "switchbind=lid_on,spawn,b",
    ].join("\n");

    const result = applyMigrations(parseConf(text));

    expect(formatConf(result.document)).toBe(
      ["switchbind=lid_on,spawn,a", "key_mode=secondary", "switchbind=lid_on,spawn,b"].join("\n"),
    );
    expect(result.remaining).toEqual([]);
  });

  it("does not merge duplicate legacy states", () => {
    const text = ["switchbind=fold,spawn,a", "switchbind=fold,spawn,b"].join("\n");

    const result = applyMigrations(parseConf(text));

    expect(formatConf(result.document)).toBe(text);
    expect(result.applied).toEqual([]);
    expect(result.remaining).toHaveLength(2);
  });
});
