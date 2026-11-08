import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { applyChange } from "./edit";
import { formatToml, parseToml } from "./toml";

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

describe("applyChange bindings", () => {
  const flags = { sym: false, lock: false, release: false, pass: false, conflict: false };

  it("updates a conf binding", () => {
    const document = parseConf("key_mode = default\nbind = SUPER,r,reload_config\n");
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags,
      trigger: "SUPER+r",
      actions: [{ dispatcher: "spawn", args: "foot" }],
    });

    expect(
      next.nodes.some((node) => node.kind === "entry" && node.raw === "bind = SUPER,r,spawn,foot"),
    ).toBe(true);
  });

  it("adds a conf binding with its mode", () => {
    const next = applyChange(parseConf(""), {
      kind: "binding",
      binding: "key",
      mode: "resize",
      flags,
      trigger: "SUPER+Left",
      actions: [{ dispatcher: "resizewin", args: "-10,0" }],
    });

    const values = next.nodes.filter((node) => node.kind === "entry").map((node) => node.raw);
    expect(values).toContain("key_mode = resize");
    expect(values).toContain("bind = SUPER,Left,resizewin,-10,0");
  });

  it("updates a toml binding", () => {
    const document = parseToml('[bind.default]\n"SUPER+r" = "reload_config"\n');
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags,
      trigger: "SUPER+r",
      actions: [{ dispatcher: "spawn", args: "foot" }],
    });

    expect(next.nodes[1]).toMatchObject({ raw: '"SUPER+r" = "spawn,foot"' });
  });

  it("writes conflicting actions as an array", () => {
    const document = parseToml("[bind.default]\n");
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags: { ...flags, conflict: true },
      trigger: "SUPER+a",
      actions: [{ dispatcher: "centerwin" }, { dispatcher: "reload_config" }],
    });

    expect(formatToml(next)).toContain('"SUPER+a" = ["centerwin", "reload_config"]');
  });

  it("appends a conflict action in toml", () => {
    const document = parseToml('[bind.default.conflict]\n"SUPER+a" = ["centerwin"]\n');
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags: { ...flags, conflict: true },
      trigger: "SUPER+a",
      actions: [{ dispatcher: "reload_config" }],
      append: true,
    });

    expect(formatToml(next)).toContain('"SUPER+a" = ["centerwin", "reload_config"]');
  });

  it("removes one conflict action in toml", () => {
    const conflictFlags = { ...flags, conflict: true };
    const document = parseToml(
      '[bind.default.conflict]\n"SUPER+a" = ["centerwin", "reload_config"]\n',
    );
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags: conflictFlags,
      trigger: "SUPER+a",
      actions: [{ dispatcher: "reload_config" }],
      remove: true,
    });

    const text = formatToml(next);
    expect(text).toContain('"SUPER+a" = ["centerwin"]');
    expect(text).not.toContain("reload_config");
  });

  it("removes one conflict action in conf", () => {
    const conflictFlags = { ...flags, conflict: true };
    const document = parseConf("bindc = SUPER,a,centerwin\nbindc = SUPER,a,reload_config\n");
    const next = applyChange(document, {
      kind: "binding",
      binding: "key",
      mode: "default",
      flags: conflictFlags,
      trigger: "SUPER+a",
      actions: [{ dispatcher: "reload_config" }],
      remove: true,
    });

    const text = next.nodes
      .filter((node) => node.kind === "entry")
      .map((node) => node.raw)
      .join("\n");
    expect(text).toContain("bindc = SUPER,a,centerwin");
    expect(text).not.toContain("reload_config");
  });
});

describe("applyChange rules", () => {
  it("updates a conf rule field", () => {
    const document = parseConf("window_rule = app_id:firefox,tags:1\n");
    const next = applyChange(document, {
      kind: "rule",
      rule: "window_rule",
      index: 0,
      field: "tags",
      value: [1, 3],
    });

    expect(next.nodes[0]).toMatchObject({ raw: "window_rule = app_id:firefox,tags:1|3" });
  });

  it("adds a missing conf rule field", () => {
    const document = parseConf("window_rule = app_id:firefox\n");
    const next = applyChange(document, {
      kind: "rule",
      rule: "window_rule",
      index: 0,
      field: "tags",
      value: [2],
    });

    expect(next.nodes[0]).toMatchObject({ raw: "window_rule = app_id:firefox,tags:2" });
  });

  it("updates a toml rule field", () => {
    const document = parseToml('[[rule.window_rule]]\napp_id = "firefox"\n');
    const next = applyChange(document, {
      kind: "rule",
      rule: "window_rule",
      index: 0,
      field: "tags",
      value: [1, 3],
    });

    expect(next.nodes.at(-1)).toMatchObject({ raw: 'tags = "1|3"' });
  });

  it("removes a toml rule field", () => {
    const document = parseToml('[[rule.window_rule]]\napp_id = "firefox"\nwidth = 800\n');
    const next = applyChange(document, {
      kind: "rule",
      rule: "window_rule",
      index: 0,
      field: "width",
      value: undefined,
    });

    expect(next.nodes.some((node) => node.kind === "entry" && node.path[2] === "width")).toBe(
      false,
    );
  });

  it("replaces a whole conf rule line", () => {
    const document = parseConf("window_rule = app_id:firefox\nexec = foot\n");
    const next = applyChange(document, {
      kind: "rule-line",
      rule: "window_rule",
      index: 0,
      value: "app_id:kitty,is_floating:1",
    });

    expect(next.nodes[0]).toMatchObject({
      raw: "window_rule = app_id:kitty,is_floating:1",
      value: "app_id:kitty,is_floating:1",
    });
    expect(next.nodes[1]).toMatchObject({ raw: "exec = foot" });
  });

  it("replaces a whole toml rule block", () => {
    const document = parseToml(
      '[[rule.window_rule]]\napp_id = "firefox"\ntags = "1"\n\n[[rule.layer_rule]]\nlayer_name = "bar"\n',
    );
    const next = applyChange(document, {
      kind: "rule-line",
      rule: "window_rule",
      index: 0,
      value: "app_id:kitty,is_floating:1",
    });

    expect(next.nodes.filter((node) => node.kind === "entry").map((node) => node.raw)).toEqual(
      expect.arrayContaining(['app_id = "kitty"', "is_floating = true"]),
    );
    expect(next.nodes.some((node) => node.raw === 'tags = "1"')).toBe(false);
  });

  it("adds and removes a whole toml rule block", () => {
    const document = parseToml("[global]\nanimations = true\n");
    const added = applyChange(document, {
      kind: "rule-line",
      rule: "window_rule",
      index: 0,
      value: "app_id:kitty",
    });

    expect(added.nodes.at(-2)).toMatchObject({
      kind: "section",
      raw: "[[rule.window_rule]]",
    });

    const removed = applyChange(added, {
      kind: "rule-line",
      rule: "window_rule",
      index: 0,
      value: undefined,
    });

    expect(removed.nodes.some((node) => node.raw === "[[rule.window_rule]]")).toBe(false);
  });
});
