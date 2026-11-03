import { serializeConf, type OptionValue } from "@mangowm.github.io/config";
import { GLOBALS } from "@mangowm.github.io/schema";

const global: Record<string, OptionValue> = {};

for (const option of GLOBALS) {
  if (Array.isArray(option.default) && option.default.length === 0) continue;
  global[option.key] = (
    Array.isArray(option.default) ? [...option.default] : option.default
  ) as OptionValue;
}

const DEFAULT_CONFIG = serializeConf({ global });

export default DEFAULT_CONFIG;
