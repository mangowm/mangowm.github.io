import { describe, expect, it } from "vite-plus/test";

import { DISPATCHER_ARG_OPTIONS, argsPattern, type DispatcherName } from "./data/dispatcherArgs";

function accepts(dispatcher: DispatcherName, args: string): boolean {
  return new RegExp(argsPattern(dispatcher)).test(args);
}

describe("dispatcher argument options", () => {
  it("defines each option list", () => {
    expect(DISPATCHER_ARG_OPTIONS.direction).toContain("alldir");
    expect(DISPATCHER_ARG_OPTIONS.circle).toEqual(["next", "prev"]);
    expect(DISPATCHER_ARG_OPTIONS.switcher).toContain("all_tag_next");
    expect(DISPATCHER_ARG_OPTIONS["mouse-action"]).toEqual([
      "curmove",
      "curresize",
      "curnormal",
      "curpressed",
    ]);
    expect(DISPATCHER_ARG_OPTIONS.bool).toEqual(["0", "1"]);
  });

  it("accepts every direction value", () => {
    for (const direction of DISPATCHER_ARG_OPTIONS.direction) {
      expect(accepts("focusdir", direction)).toBe(true);
    }
    expect(accepts("focusdir", "LEFT")).toBe(true);
    expect(accepts("focusdir", "sideways")).toBe(false);
  });

  it("accepts every option value", () => {
    const cases: [DispatcherName, readonly string[]][] = [
      ["focusstack", DISPATCHER_ARG_OPTIONS.circle],
      ["overcircle", DISPATCHER_ARG_OPTIONS.overcircle],
      ["switcher", DISPATCHER_ARG_OPTIONS.switcher],
      ["view_insert", DISPATCHER_ARG_OPTIONS["prev-next"]],
      ["moveresize", DISPATCHER_ARG_OPTIONS["mouse-action"]],
      ["killclient", DISPATCHER_ARG_OPTIONS.force],
      ["setlayout", DISPATCHER_ARG_OPTIONS.layout],
    ];

    for (const [dispatcher, options] of cases) {
      for (const option of options) {
        expect(accepts(dispatcher, option)).toBe(true);
      }
    }
  });

  it("accepts on-off and boolean values", () => {
    for (const option of DISPATCHER_ARG_OPTIONS["on-off"]) {
      expect(accepts("togglehdr", `${option},eDP-1`)).toBe(true);
    }

    for (const option of DISPATCHER_ARG_OPTIONS.bool) {
      expect(accepts("view", `1,${option}`)).toBe(true);
    }
  });
});
