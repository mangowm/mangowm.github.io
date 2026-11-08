export { schema, type SchemaDocument } from "./schema";
export {
  DISPATCHER_ARGS,
  DISPATCHERS,
  type DispatcherArgKind,
  type DispatcherName,
} from "./data/dispatcherArgs";
export { DIRECTIVES, type DirectiveDef, type DirectiveKey } from "./data/directives";
export { GLOBALS } from "./data/globals";
export { LAYOUTS } from "./data/layouts";
export { RULES } from "./data/rules";
export { ALL_TAGS, TAG_COUNT, TAG_MASK_PATTERN, TAG_NUMBER_PATTERN } from "./data/tags";
export type { GlobalDef, RuleDef, RuleFieldDef } from "./data/types";
export { MANGO_VERSION } from "./version";
