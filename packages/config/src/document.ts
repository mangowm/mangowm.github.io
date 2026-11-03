import type { ConfigFormat, SourceLocation } from "./types";

/** An empty line, preserved so formatting round-trips. */
export interface BlankNode {
  kind: "blank";
  raw: string;
  at: SourceLocation;
}

/** A full-line comment. */
export interface CommentNode {
  kind: "comment";
  raw: string;
  at: SourceLocation;
}

/** A table header. `array` is true for `[[name]]`. */
export interface SectionNode {
  kind: "section";
  path: readonly string[];
  array: boolean;
  raw: string;
  at: SourceLocation;
}

/** A `key = value` line. `path` is the full key path. */
export interface EntryNode {
  kind: "entry";
  path: readonly string[];
  value: string;
  raw: string;
  at: SourceLocation;
}

/** A line the parser does not understand; kept so nothing is lost. */
export interface RawNode {
  kind: "raw";
  raw: string;
  at: SourceLocation;
}

export type DocumentNode = BlankNode | CommentNode | SectionNode | EntryNode | RawNode;

/** Lossless text model: comments, blank lines, ordering, and duplicates survive. */
export interface ConfigDocument {
  format: ConfigFormat;
  newline: "\n" | "\r\n";
  nodes: DocumentNode[];
}
