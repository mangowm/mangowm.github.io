import { describe, expect, it } from "vite-plus/test";

import { ALL_TAGS, formatTagId, formatTagMask, parseTagId, parseTagMask } from "./tag";
import { ValueError } from "./value";

describe("tag masks", () => {
  it("parses single tags and masks", () => {
    expect(parseTagMask("3")).toEqual([3]);
    expect(parseTagMask("1|3|5")).toEqual([1, 3, 5]);
    expect(parseTagMask("5|1|3")).toEqual([1, 3, 5]);
  });

  it("expands the all-tags forms", () => {
    expect(parseTagMask("-1")).toEqual([...ALL_TAGS]);
    expect(parseTagMask("00")).toEqual([...ALL_TAGS]);
  });

  it("keeps tag 0 exclusive", () => {
    expect(parseTagMask("0")).toEqual([0]);
    expect(parseTagMask("0|1")).toEqual([0]);
  });

  it("keeps variables unresolved", () => {
    expect(parseTagMask("$tags")).toBe("$tags");
  });

  it("rejects out-of-range tags", () => {
    expect(() => parseTagMask("32")).toThrow(ValueError);
  });

  it("round-trips", () => {
    expect(formatTagMask([3])).toBe("3");
    expect(formatTagMask([1, 3, 5])).toBe("1|3|5");
    expect(formatTagMask([0])).toBe("0");
    expect(formatTagMask([...ALL_TAGS])).toBe("-1");
  });
});

describe("tag ids", () => {
  it("accepts numbers, star, and variables", () => {
    expect(parseTagId("0")).toBe(0);
    expect(parseTagId("31")).toBe(31);
    expect(parseTagId("*")).toBe("*");
    expect(parseTagId("$tag")).toBe("$tag");
  });

  it("rejects out-of-range ids", () => {
    expect(() => parseTagId("-1")).toThrow(ValueError);
    expect(() => parseTagId("32")).toThrow(ValueError);
  });

  it("formats back to text", () => {
    expect(formatTagId(31)).toBe("31");
    expect(formatTagId("*")).toBe("*");
  });
});
