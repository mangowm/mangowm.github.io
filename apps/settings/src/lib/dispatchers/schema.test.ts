import { describe, expect, it } from "vite-plus/test";
import { DISPATCHERS, DISPATCHER_ARGS } from "@mangowm.github.io/config/catalog";

import { DIRECTION_OPTS } from "./types";
import { MANGO_DISPATCHERS } from "./index";

describe("dispatcher metadata", () => {
  it("covers every schema dispatcher", () => {
    expect(MANGO_DISPATCHERS.map((dispatcher) => dispatcher.name)).toEqual([...DISPATCHERS]);
  });

  it("uses the schema argument count", () => {
    for (const name of DISPATCHERS) {
      const dispatcher = MANGO_DISPATCHERS.find((candidate) => candidate.name === name);
      expect(dispatcher?.args.length).toBe(DISPATCHER_ARGS[name].length);
    }
  });

  it("offers every direction the schema accepts", () => {
    expect(DIRECTION_OPTS).toEqual(["left", "right", "up", "down", "alldir"]);
  });

  it("maps schema argument kinds to the right controls", () => {
    const arg = (name: string, index: number) =>
      MANGO_DISPATCHERS.find((dispatcher) => dispatcher.name === name)?.args[index];

    expect(arg("killclient", 0)?.type).toBe("force");
    expect(arg("killclient", 0)?.options).toEqual(["force", "unforce"]);
    expect(arg("togglehdr", 0)?.type).toBe("on-off");
    expect(arg("togglehdr", 0)?.options).toEqual(["on", "off", "toggle"]);
    expect(arg("comboview", 0)?.type).toBe("tag-mask");
    expect(arg("focusmon", 0)?.type).toBe("monitor");
    expect(arg("spawn", 0)?.type).toBe("command");
  });
});
