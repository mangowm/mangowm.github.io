import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { schema } from "../src/schema.ts";
import { MANGO_VERSION } from "../src/version.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "schemas", MANGO_VERSION);

mkdirSync(output, { recursive: true });

writeFileSync(join(output, "schema.json"), `${JSON.stringify(schema, null, 2)}\n`);
