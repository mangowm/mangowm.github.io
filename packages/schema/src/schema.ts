import type { TSchema } from "typebox";

import { actionDefs } from "./builders/actions";
import { bindingDefs } from "./builders/bindings";
import { rootSchema } from "./builders/values";
import { MANGO_VERSION } from "./version";

export interface SchemaDocument {
  $schema: string;
  $id: string;
  $defs: Record<string, TSchema>;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}

export const schema: SchemaDocument = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: `https://mangowm.github.io/schema/${MANGO_VERSION}/schema.json`,
  $defs: {
    ...actionDefs(),
    ...bindingDefs(),
  },
  ...rootSchema(),
  title: "mangowm configuration",
};
