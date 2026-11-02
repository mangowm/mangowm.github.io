import { canonicalActionDefs } from "./builders/actions";
import { bindingDefs } from "./builders/bindings";
import type { SchemaDocument } from "./builders/document";
import { globalDefs, rootSchema, ruleDefs } from "./builders/values";

export function buildCanonicalSchema(version: string): SchemaDocument {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/schema.json`,
    $defs: {
      ...canonicalActionDefs(),
      ...bindingDefs("canonical"),
      ...globalDefs("canonical"),
      ...ruleDefs("canonical"),
    },
    ...rootSchema("canonical", version),
    title: `mangowm configuration ${version}`,
  } satisfies SchemaDocument;
}
