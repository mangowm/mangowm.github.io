import {
  ALL_TAGS,
  BINDING_DIRECTIONS,
  BINDING_FLAG_LETTERS,
  BINDING_FLAGS,
  BINDING_FOLD_STATES,
  BINDING_KEYWORDS,
  BINDING_KINDS,
  CATEGORIES,
  DIRECTIVES,
  DISPATCHER_ARG_META,
  DISPATCHER_ARG_OPTIONS,
  DISPATCHER_ALIASES,
  DISPATCHER_CATEGORIES,
  DISPATCHER_CATEGORY_ORDER,
  DISPATCHER_DESCRIPTIONS,
  DISPATCHER_EXAMPLES,
  DISPATCHERS,
  GLOBAL_CATEGORY_ORDER,
  GLOBAL_META,
  GLOBALS,
  LAYOUTS,
  MODIFIER_ORDER,
  MOUSE_BUTTONS,
  RULES,
  RULE_CATEGORIES,
  RULE_CATEGORY_ORDER,
  RULE_FIELD_META,
  RULE_MATCHERS,
  RULE_MATCHER_META,
  TAG_COUNT,
  TAG_MASK_PATTERN,
  TAG_NUMBER_PATTERN,
} from "./data";
import { MANGO_VERSION } from "./version";

export function buildCatalog() {
  return {
    mangoVersion: MANGO_VERSION,
    schema: `https://mangowm.github.io/config/${MANGO_VERSION}/schema.json`,
    categories: CATEGORIES,
    dispatcherCategoryOrder: DISPATCHER_CATEGORY_ORDER,
    ruleCategoryOrder: RULE_CATEGORY_ORDER,
    globalCategoryOrder: GLOBAL_CATEGORY_ORDER,
    globals: Object.fromEntries(
      GLOBALS.map((item) => {
        const meta = GLOBAL_META[item.key];
        return [
          item.key,
          {
            ...item,
            category: meta?.category ?? "system",
            ...(meta?.aliases ? { aliases: meta.aliases } : {}),
            ...(meta?.ui ? { ui: meta.ui } : {}),
          },
        ];
      }),
    ),
    rules: Object.fromEntries(
      RULES.map((item) => [
        item.key,
        {
          ...item,
          category: RULE_CATEGORIES[item.key],
          matchers: RULE_MATCHERS[item.key],
          fieldMeta: RULE_FIELD_META[item.key],
          matcherMeta: RULE_MATCHER_META[item.key],
        },
      ]),
    ),
    dispatchers: Object.fromEntries(
      DISPATCHERS.map((name) => [
        name,
        {
          category: DISPATCHER_CATEGORIES[name],
          description: DISPATCHER_DESCRIPTIONS[name],
          aliases: DISPATCHER_ALIASES[name] ?? [],
          examples: DISPATCHER_EXAMPLES[name] ?? [],
          args: DISPATCHER_ARG_META[name],
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
