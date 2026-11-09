import { describe, expect, it } from "vite-plus/test";

import { GLOBALS } from "./data/globals";
import { ALL_TAGS, TAG_COUNT, TAG_MASK_PATTERN, TAG_NUMBER_PATTERN } from "./data/tags";

const tagNumber = new RegExp(`^(?:${TAG_NUMBER_PATTERN})$`);
const tagMask = new RegExp(`^(?:${TAG_MASK_PATTERN})$`);

describe("tag constants", () => {
  it("matches the supported tag range", () => {
    expect(TAG_COUNT).toBe(31);
    expect(ALL_TAGS).toHaveLength(TAG_COUNT);
    expect(ALL_TAGS[0]).toBe(1);
    expect(ALL_TAGS.at(-1)).toBe(TAG_COUNT);
  });

  it("uses the shared maximum for tag_num", () => {
    const tagNum = GLOBALS.find((option) => option.key === "tag_num");
    expect(tagNum && "max" in tagNum ? tagNum.max : undefined).toBe(TAG_COUNT);
  });

  it("matches tag numbers", () => {
    for (const value of ["0", "1", "9", "10", "31", "-1", "00"]) {
      expect(tagNumber.test(value)).toBe(true);
    }

    for (const value of ["32", "-2", "1.5"]) {
      expect(tagNumber.test(value)).toBe(false);
    }
  });

  it("matches tag masks", () => {
    expect(tagMask.test("1|3|5")).toBe(true);
    expect(tagMask.test("1 | 31")).toBe(true);
    expect(tagMask.test("32")).toBe(false);
    expect(tagMask.test("1|")).toBe(false);
  });
});
