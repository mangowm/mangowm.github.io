import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildCatalog } from "../src/schema/catalog.ts";
import { schema } from "../src/schema/schema.ts";
import { MANGO_VERSION } from "../src/schema/version.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "schemas", MANGO_VERSION);

mkdirSync(output, { recursive: true });

writeFileSync(join(output, "schema.json"), `${JSON.stringify(schema, null, 2)}\n`);
writeFileSync(join(output, "catalog.json"), `${JSON.stringify(buildCatalog(), null, 2)}\n`);
