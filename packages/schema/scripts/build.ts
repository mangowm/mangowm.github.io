import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSchema } from "../src/schema.ts";
import { MANGO_VERSION } from "../src/version.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "schemas", MANGO_VERSION, "schema.json");

mkdirSync(join(root, "schemas", MANGO_VERSION), { recursive: true });
writeFileSync(output, `${JSON.stringify(buildSchema(MANGO_VERSION), null, 2)}\n`);
