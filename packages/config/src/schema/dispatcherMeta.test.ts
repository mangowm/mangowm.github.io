import { describe, expect, it } from "vite-plus/test";

import {
  DISPATCHER_ALIASES,
  DISPATCHER_ARG_META,
  DISPATCHER_DESCRIPTIONS,
  DISPATCHER_EXAMPLES,
} from "./data/dispatcherMeta";
import { DISPATCHER_ARGS, DISPATCHERS, argsPattern } from "./data/dispatcherArgs";

describe("dispatcher metadata", () => {
  it("covers every dispatcher", () => {
    expect(Object.keys(DISPATCHER_DESCRIPTIONS).sort()).toEqual([...DISPATCHERS].sort());
    expect(Object.keys(DISPATCHER_ARG_META).sort()).toEqual([...DISPATCHERS].sort());
  });

  it("has a description for every dispatcher", () => {
    for (const dispatcher of DISPATCHERS) {
      expect(DISPATCHER_DESCRIPTIONS[dispatcher].trim()).not.toBe("");
    }
  });

  it("matches each dispatcher argument signature", () => {
    for (const dispatcher of DISPATCHERS) {
      expect(DISPATCHER_ARG_META[dispatcher].map((arg) => arg.kind)).toEqual(
        DISPATCHER_ARGS[dispatcher],
      );
    }
  });

  it("has a label and description for every argument", () => {
    for (const dispatcher of DISPATCHERS) {
      for (const arg of DISPATCHER_ARG_META[dispatcher]) {
        expect(arg.label.trim()).not.toBe("");
        expect(arg.description.trim()).not.toBe("");
      }
    }
  });

  it("uses only supported dispatcher keys for aliases and examples", () => {
    for (const dispatcher of [
      ...Object.keys(DISPATCHER_ALIASES),
      ...Object.keys(DISPATCHER_EXAMPLES),
    ]) {
      expect(DISPATCHERS).toContain(dispatcher);
    }
  });

  it("keeps examples valid for their dispatcher signature", () => {
    for (const [dispatcher, examples] of Object.entries(DISPATCHER_EXAMPLES)) {
      const pattern = new RegExp(argsPattern(dispatcher as keyof typeof DISPATCHER_ARGS));
      for (const example of examples) expect(pattern.test(example)).toBe(true);
    }
  });

  it("uses unique non-empty aliases", () => {
    for (const aliases of Object.values(DISPATCHER_ALIASES)) {
      expect(new Set(aliases).size).toBe(aliases.length);
      for (const alias of aliases) expect(alias.trim()).not.toBe("");
    }
  });
});
