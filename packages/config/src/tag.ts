import { ALL_TAGS, TAG_COUNT } from "./schema/data";

import { ValueError, isVariable, parseInteger } from "./value";

export { ALL_TAGS };

/** A parsed rule tag id: a number, `*`, or an unresolved variable. */
export type TagId = number | string;

/** Parse a tag mask (`3`, `1|3|5`, `-1`, `00`, `0`). */
export function parseTagMask(text: string): number[] | string {
  const value = text.trim();
  if (isVariable(value)) return value;
  if (value === "-1" || value === "00") return [...ALL_TAGS];

  const parts = value
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (parts.length === 0) {
    throw new ValueError("expected a tag mask, got an empty value");
  }

  const tags = new Set<number>();
  for (const part of parts) {
    const tag = parseInteger(part);
    // Tag 0 is the special workspace and is exclusive.
    if (tag === 0) return [0];
    if (tag < 1 || tag > TAG_COUNT) {
      throw new ValueError(`tag ${tag} is out of range`);
    }
    tags.add(tag);
  }

  return [...tags].sort((left, right) => left - right);
}

/** Format a canonical tag list back to a mask. */
export function formatTagMask(tags: readonly number[]): string {
  if (tags.length === 1 && tags[0] === 0) return "0";
  if (tags.length === ALL_TAGS.length && tags.every((tag, index) => tag === index + 1)) {
    return "-1";
  }
  return tags.join("|");
}

/** Parse a rule tag id (`0`–`31`, `*`, or a variable). */
export function parseTagId(text: string): TagId {
  const value = text.trim();
  if (value === "*") return "*";
  if (isVariable(value)) return value;

  const tag = parseInteger(value);
  if (tag < 0 || tag > TAG_COUNT) {
    throw new ValueError(`tag id ${tag} is out of range`);
  }
  return tag;
}

/** Format a rule tag id. */
export function formatTagId(id: TagId): string {
  return String(id);
}
