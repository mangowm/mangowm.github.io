import Schema from "typebox/schema";

import { schema } from "./schema";

export { buildSchema, schema } from "./schema";
export { MANGO_VERSION } from "./version";

export const actionSchema = schema.$defs.Action;
export const validateAction = Schema.Compile(actionSchema);
export const validate = Schema.Compile(schema);
