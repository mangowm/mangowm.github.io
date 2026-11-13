import { describe, expect, it } from "vite-plus/test";

import { DISPATCHER_ARG_META, DISPATCHER_DESCRIPTIONS } from "./data/dispatcherMeta";
import { DISPATCHER_ARGS, DISPATCHERS } from "./data/dispatcherArgs";

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
});
