import { tomlActionDefs } from "./builders/actions";
import { bindingDefs } from "./builders/bindings";
import type { SchemaDocument } from "./builders/document";
import { globalDefs, rootSchema, ruleDefs } from "./builders/values";

export function buildTomlSchema(version: string): SchemaDocument {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/toml.schema.json`,
    $defs: {
      ...tomlActionDefs(),
      ...bindingDefs("toml"),
      ...globalDefs("toml"),
      ...ruleDefs("toml"),
    },
    ...rootSchema("toml", version),
    title: `mangowm TOML configuration ${version}`,
  } satisfies SchemaDocument;
}
