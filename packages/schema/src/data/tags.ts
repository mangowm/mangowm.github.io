export const TAG_COUNT = 31;

export const ALL_TAGS: readonly number[] = Array.from(
  { length: TAG_COUNT },
  (_, index) => index + 1,
);

export const TAG_NUMBER_PATTERN = "(?:-1|00|[0-9]|[12][0-9]|3[01])";

export const TAG_MASK_PATTERN = `${TAG_NUMBER_PATTERN}(?:\\s*\\|\\s*${TAG_NUMBER_PATTERN})*`;
