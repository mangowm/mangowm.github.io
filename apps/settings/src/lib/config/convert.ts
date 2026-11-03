import { convertDocument as convertConfigDocument, convertName } from "@mangowm.github.io/config";

import { detectFormat, parseDocument } from "./parse";
import type { ConfigDocument } from "@mangowm.github.io/config";
import type { FileFormat, SourceFile } from "./types";

export { convertName };

export function convertDocument(document: ConfigDocument, target: FileFormat): string {
  return convertConfigDocument(document, target);
}

export function convertFile(file: SourceFile, target: FileFormat): string {
  return convertConfigDocument(file.document, target);
}

export function convertText(text: string, format: FileFormat, target: FileFormat): string {
  if (format === target) return text;
  return convertConfigDocument(parseDocument(text, format), target);
}

export function convertOriginal(file: SourceFile, target: FileFormat): string {
  return convertText(file.original, detectFormat(file.absPath, file.original), target);
}
