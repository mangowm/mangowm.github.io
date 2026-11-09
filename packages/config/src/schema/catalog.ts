import {
  ALL_TAGS,
  BINDING_DIRECTIONS,
  BINDING_FLAG_LETTERS,
  BINDING_FLAGS,
  BINDING_FOLD_STATES,
  BINDING_KEYWORDS,
  BINDING_KINDS,
  DIRECTIVES,
  DISPATCHER_ARG_OPTIONS,
  DISPATCHER_ARGS,
  DISPATCHERS,
  GLOBALS,
  LAYOUTS,
  MODIFIER_ORDER,
  MOUSE_BUTTONS,
  RULES,
  TAG_COUNT,
  TAG_MASK_PATTERN,
  TAG_NUMBER_PATTERN,
} from "./data";
import { MANGO_VERSION } from "./version";

export function buildCatalog() {
  return {
    mangoVersion: MANGO_VERSION,
    schema: `https://mangowm.github.io/config/${MANGO_VERSION}/schema.json`,
    globals: Object.fromEntries(GLOBALS.map((item) => [item.key, item])),
    rules: Object.fromEntries(RULES.map((item) => [item.key, item])),
    dispatchers: Object.fromEntries(
      DISPATCHERS.map((name) => [
        name,
        {
          args: DISPATCHER_ARGS[name],
        },
      ]),
    ),
    dispatcherArgOptions: DISPATCHER_ARG_OPTIONS,
    layouts: [...LAYOUTS],
    directives: Object.fromEntries(DIRECTIVES.map((item) => [item.key, item])),
    bindings: {
      kinds: BINDING_KINDS,
      keywords: BINDING_KEYWORDS,
      flags: BINDING_FLAGS,
      flagLetters: BINDING_FLAG_LETTERS,
      mouseButtons: MOUSE_BUTTONS,
      directions: BINDING_DIRECTIONS,
      foldStates: BINDING_FOLD_STATES,
      modifierOrder: MODIFIER_ORDER,
    },
    tags: {
      count: TAG_COUNT,
      all: ALL_TAGS,
      numberPattern: TAG_NUMBER_PATTERN,
      maskPattern: TAG_MASK_PATTERN,
    },
  };
}
