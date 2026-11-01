import Schema from "typebox/schema";

import { schema, tomlSchema } from "./schema";

export { buildCanonicalSchema, buildTomlSchema, schema, tomlSchema } from "./schema";
export { MANGO_VERSION } from "./version";

export const validateCanonical = Schema.Compile(schema);
export const validateToml = Schema.Compile(tomlSchema);
