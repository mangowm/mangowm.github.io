import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildCanonicalSchema, buildTomlSchema } from "../src/schema.ts";
import { MANGO_VERSION } from "../src/version.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "schemas", MANGO_VERSION);

mkdirSync(output, { recursive: true });

for (const [file, build] of [
  ["schema.json", buildCanonicalSchema],
  ["toml.schema.json", buildTomlSchema],
] as const) {
  writeFileSync(join(output, file), `${JSON.stringify(build(MANGO_VERSION), null, 2)}\n`);
}
