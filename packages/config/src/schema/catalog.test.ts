import { describe, expect, it } from "vite-plus/test";

import { buildCatalog } from "./catalog";
import { DISPATCHER_ARGS, DISPATCHERS } from "./data/dispatcherArgs";
import { schema } from "./schema";

const catalog = buildCatalog();

function propertiesOf(name: string): string[] {
  const section = schema.properties[name] as { properties?: Record<string, unknown> } | undefined;
  return Object.keys(section?.properties ?? {});
}

describe("catalog consistency", () => {
  it("covers every schema global", () => {
    expect([...Object.keys(catalog.globals), ...Object.keys(catalog.directives)].sort()).toEqual(
      propertiesOf("global").sort(),
    );
  });

  it("covers every schema rule", () => {
    expect(Object.keys(catalog.rules).sort()).toEqual(propertiesOf("rule").sort());
  });

  it("covers every dispatcher and its argument signature", () => {
    expect(Object.keys(catalog.dispatchers).sort()).toEqual([...DISPATCHERS].sort());

    for (const dispatcher of DISPATCHERS) {
      expect(catalog.dispatchers[dispatcher].args).toEqual(DISPATCHER_ARGS[dispatcher]);
    }
  });

  it("points at the matching schema artifact", () => {
    expect(catalog.schema).toBe(schema.$id);
  });
});
