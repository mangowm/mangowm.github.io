import type { TSchema } from "typebox";

export interface SchemaDocument {
  $schema: string;
  $id: string;
  $defs: Record<string, TSchema>;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}
