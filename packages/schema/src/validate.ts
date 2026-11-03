import Schema from "typebox/schema";

import { schema } from "./schema";

export const validate = Schema.Compile(schema);
