import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { applyChange } from "./edit";
import { parseToml } from "./toml";

describe("applyChange conf", () => {
  it("updates an option and keeps its comment", () => {
    const document = parseConf("blur = 1 # note\n");
    const next = applyChange(document, { kind: "option", key: "blur", value: false });

    expect(next.nodes[0]).toMatchObject({ value: "0", raw: "blur = 0 # note" });
  });

  it("appends a missing option", () => {
    const document = parseConf("blur = 1\n");
    const next = applyChange(document, { kind: "option", key: "border_radius", value: 8 });

    expect(next.nodes.at(-1)).toMatchObject({
      kind: "entry",
      value: "8",
      raw: "border_radius = 8",
    });
  });

  it("rewrites all directive lines", () => {
    const document = parseConf("exec = first\nexec = second\n");
    const next = applyChange(document, {
      kind: "directive",
      key: "exec",
      values: ["third", "fourth"],
    });

    expect(next.nodes.filter((node) => node.kind === "entry").map((node) => node.value)).toEqual([
      "third",
      "fourth",
    ]);
  });

  it("updates an env pair", () => {
    const document = parseConf("env = DPI,140\n");
    const next = applyChange(document, { kind: "pair", table: "env", name: "DPI", value: "96" });

    expect(next.nodes[0]).toMatchObject({ value: "DPI,96", raw: "env = DPI,96" });
  });

  it("removes an env pair", () => {
    const document = parseConf("env = DPI,140\n");
    const next = applyChange(document, { kind: "pair", table: "env", name: "DPI" });

    expect(next.nodes.some((node) => node.kind === "entry")).toBe(false);
  });
});

describe("applyChange toml", () => {
  it("updates an option", () => {
    const document = parseToml("[global]\nblur = 1\n");
    const next = applyChange(document, { kind: "option", key: "blur", value: false });

    expect(next.nodes[1]).toMatchObject({ value: "false", raw: "blur = false" });
  });

  it("adds a missing option to the global table", () => {
    const document = parseToml("[global]\nblur = 1\n");
    const next = applyChange(document, { kind: "option", key: "border_radius", value: 8 });

    expect(next.nodes.at(-1)).toMatchObject({
      kind: "entry",
      path: ["global", "border_radius"],
      raw: "border_radius = 8",
    });
  });

  it("rewrites directive arrays", () => {
    const document = parseToml('[global]\nexec = ["first"]\n');
    const next = applyChange(document, {
      kind: "directive",
      key: "exec",
      values: ["first", "second"],
    });

    expect(next.nodes[1]).toMatchObject({ raw: 'exec = ["first", "second"]' });
  });

  it("updates an env pair", () => {
    const document = parseToml('[env]\n"DPI" = "140"\n');
    const next = applyChange(document, { kind: "pair", table: "env", name: "DPI", value: "96" });

    expect(next.nodes[1]).toMatchObject({ value: "96", raw: '"DPI" = "96"' });
  });
});
