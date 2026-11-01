import { buildCanonicalSchema } from "./canonical";
import { buildTomlSchema } from "./toml";
import { MANGO_VERSION } from "./version";

export { buildCanonicalSchema } from "./canonical";
export { buildTomlSchema } from "./toml";

export const schema = buildCanonicalSchema(MANGO_VERSION);
export const tomlSchema = buildTomlSchema(MANGO_VERSION);
