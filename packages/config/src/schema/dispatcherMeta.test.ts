import { describe, expect, it } from "vite-plus/test";

import { DISPATCHER_DESCRIPTIONS } from "./data/dispatcherMeta";
import { DISPATCHERS } from "./data/dispatcherArgs";

describe("dispatcher descriptions", () => {
  it("covers every dispatcher", () => {
    expect(Object.keys(DISPATCHER_DESCRIPTIONS).sort()).toEqual([...DISPATCHERS].sort());
  });

  it("has a description for every dispatcher", () => {
    for (const dispatcher of DISPATCHERS) {
      expect(DISPATCHER_DESCRIPTIONS[dispatcher].trim()).not.toBe("");
    }
  });
});
