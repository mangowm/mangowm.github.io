import { actionDefs } from "./builders/actions";
import { bindingDefs } from "./builders/bindings";
import type { SchemaDocument } from "./builders/document";
import { globalDefs, rootSchema, ruleDefs } from "./builders/values";
import { MANGO_VERSION } from "./version";

export function buildSchema(version: string): SchemaDocument {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/schema.json`,
    $defs: {
      ...actionDefs(),
      ...bindingDefs(),
      ...globalDefs(),
      ...ruleDefs(),
    },
    ...rootSchema(version),
    title: `mangowm configuration ${version}`,
  } satisfies SchemaDocument;
}

export const schema = buildSchema(MANGO_VERSION);
