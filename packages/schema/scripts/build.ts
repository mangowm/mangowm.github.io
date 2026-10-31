import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSchema } from "../src/schema.ts";
import { MANGO_VERSION } from "../src/version.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "schemas", MANGO_VERSION);

mkdirSync(output, { recursive: true });

for (const [file, mode] of [
  ["schema.json", "canonical"],
  ["toml.schema.json", "toml"],
] as const) {
  writeFileSync(
    join(output, file),
    `${JSON.stringify(buildSchema(MANGO_VERSION, mode), null, 2)}\n`,
  );
}
