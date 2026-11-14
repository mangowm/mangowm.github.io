import { convertFile, convertName, convertOriginal } from "./convert";
import type { FileFormat, SourceFile } from "./types";

export interface ConfigDiffModel {
  /** File name in the format the diff is rendered in. */
  name: string;
  language: "ini" | "toml";
  /** On-disk text, represented in the target format. */
  oldText: string;
  /** Current document, represented in the target format. */
  newText: string;
  changed: boolean;
}

/**
 * Build the pending diff for a file.
 *
 * The comparison is intentionally performed in the format that Apply will
 * write, so a pending conf→toml conversion is shown as the user will actually
 * see it on disk. `convertOriginal` and `convertFile` are the only format
 * boundary; the view layer just renders the result.
 */
export function diffConfigFile(file: SourceFile, target: FileFormat): ConfigDiffModel {
  const oldText = convertOriginal(file, target);
  const newText = convertFile(file, target);

  return {
    name: convertName(file.refPath, target),
    language: target === "toml" ? "toml" : "ini",
    oldText,
    newText,
    changed: oldText !== newText,
  };
}
