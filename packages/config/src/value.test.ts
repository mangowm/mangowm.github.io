import type { GlobalDef } from "./schema/data";
import { describe, expect, it } from "vite-plus/test";

import {
  ValueError,
  isVariable,
  parseBool,
  parseColor,
  parseCurve,
  parseEnum,
  parseInteger,
  parseLayouts,
  parseNumber,
  parseOption,
  parsePreset,
} from "./value";

describe("scalar values", () => {
  it("accepts both boolean spellings used by mango", () => {
    expect(parseBool("1")).toBe(true);
    expect(parseBool("true")).toBe(true);
    expect(parseBool("0")).toBe(false);
    expect(parseBool("FALSE")).toBe(false);
  });

  it("rejects other booleans", () => {
    expect(() => parseBool("maybe")).toThrow(ValueError);
  });

  it("parses integers and numbers", () => {
    expect(parseInteger("42")).toBe(42);
    expect(parseInteger("-1")).toBe(-1);
    expect(parseNumber("0.55")).toBe(0.55);
    expect(() => parseInteger("1.5")).toThrow(ValueError);
    expect(() => parseNumber("")).toThrow(ValueError);
  });

  it("normalizes colors to eight hex digits", () => {
    expect(parseColor("0x323232")).toBe("0x323232ff");
    expect(parseColor("0x323232FF")).toBe("0x323232ff");
    expect(parseColor("#11223344")).toBe("0x11223344");
    expect(() => parseColor("323232")).toThrow(ValueError);
  });

  it("requires four non-negative curve points", () => {
    expect(parseCurve("0.25, 0.1, 0.25, 1")).toEqual([0.25, 0.1, 0.25, 1]);
    expect(() => parseCurve("0,1,2")).toThrow(ValueError);
    expect(() => parseCurve("0,-1,2,3")).toThrow(ValueError);
  });

  it("parses preset lists", () => {
    expect(parsePreset("0.5, 0.8, 1.0")).toEqual([0.5, 0.8, 1]);
    expect(() => parsePreset("")).toThrow(ValueError);
  });

  it("validates layouts", () => {
    expect(parseLayouts("tile, scroller")).toEqual(["tile", "scroller"]);
    expect(() => parseLayouts("tile, nope")).toThrow(ValueError);
  });

  it("parses string and numeric enums", () => {
    const options = [{ value: "1" }, { value: "0" }];

    expect(parseEnum("1", options, true)).toBe(1);
    expect(() => parseEnum("2", options, true)).toThrow(ValueError);
    expect(parseEnum("fade", [{ value: "fade" }])).toBe("fade");
  });
});

describe("variables", () => {
  it("recognizes both reference forms", () => {
    expect(isVariable("$term")).toBe(true);
    expect(isVariable("${term}")).toBe(true);
    expect(isVariable("term")).toBe(false);
  });

  it("keeps a variable unresolved for every option type", () => {
    const def: GlobalDef = {
      key: "animation_duration_move",
      type: "int",
      default: 0,
      label: "",
      description: "",
    };

    expect(parseOption("$duration", def)).toBe("$duration");
  });
});

describe("parseOption", () => {
  const boolDef: GlobalDef = {
    key: "blur",
    type: "bool",
    default: true,
    label: "",
    description: "",
  };

  it("dispatches on the option type", () => {
    expect(parseOption("0", boolDef)).toBe(false);
  });

  it("keeps plain strings untouched", () => {
    const def: GlobalDef = {
      key: "term",
      type: "string",
      default: "",
      label: "",
      description: "",
    };

    expect(parseOption("foot --hold", def)).toBe("foot --hold");
  });
});
