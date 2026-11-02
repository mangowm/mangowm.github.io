import Type, { type TSchema } from "typebox";

import { BINDING_KEY_PATTERNS, type BindingKind } from "../data/bindingKeys";
import type { SchemaMode } from "./mode";

const KEY_FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const KEY_FLAG_DEFS = [
  "KeyBindingNode",
  "KeySymBindingNode",
  "KeyLockBindingNode",
  "KeyReleaseBindingNode",
  "KeyPassBindingNode",
  "KeyConflictBindingNode",
] as const;

function canonicalKeyBindingNode(start: number): TSchema {
  const allowed = KEY_FLAGS.map((flag, index) => [flag, index] as const).filter(
    ([, index]) => index >= start,
  );
  const flagProperties = Object.fromEntries(
    allowed.map(([flag, index]) => [flag, Type.Ref(`#/$defs/${KEY_FLAG_DEFS[index + 1]}`)]),
  );
  const flagPatterns = Object.fromEntries(
    allowed.map(([flag, index]) => [`^${flag}$`, Type.Ref(`#/$defs/${KEY_FLAG_DEFS[index + 1]}`)]),
  );
  const action =
    start === KEY_FLAGS.length
      ? Type.Ref("#/$defs/CanonicalConflictActions")
      : Type.Ref("#/$defs/CanonicalSingleAction");

  return Type.Unsafe<TSchema>({
    title: start === 0 ? "Binding node" : `Binding node after ${KEY_FLAGS[start - 1]}`,
    description: "Maps key combinations to actions. Flag sub-tables are optional.",
    type: "object",
    ...(start === 0 ? { properties: flagProperties } : {}),
    patternProperties: {
      ...(start === 0 ? {} : flagPatterns),
      [BINDING_KEY_PATTERNS.key]: action,
    },
    additionalProperties: false,
  });
}

function tomlKeyBindingNode(): TSchema {
  const flags = Object.fromEntries(
    KEY_FLAGS.map((flag) => [
      flag,
      Type.Ref(flag === "conflict" ? "#/$defs/KeyConflictBindingNode" : "#/$defs/KeyBindingNode"),
    ]),
  );

  return Type.Unsafe<TSchema>({
    title: "Binding node",
    description: "Maps key combinations to actions. Flag sub-tables are optional.",
    type: "object",
    properties: flags,
    patternProperties: {
      [BINDING_KEY_PATTERNS.key]: Type.Ref("#/$defs/TomlSingleAction"),
    },
    additionalProperties: false,
  });
}

function tomlKeyConflictBindingNode(): TSchema {
  const flags = Object.fromEntries(
    KEY_FLAGS.map((flag) => [flag, Type.Ref("#/$defs/KeyConflictBindingNode")]),
  );

  return Type.Unsafe<TSchema>({
    title: "Binding node after conflict",
    description: "Maps key combinations to actions. Flag sub-tables are optional.",
    type: "object",
    properties: flags,
    patternProperties: {
      [BINDING_KEY_PATTERNS.key]: Type.Ref("#/$defs/TomlMultipleActions"),
    },
    additionalProperties: false,
  });
}

function plainBindingNode(mode: SchemaMode, kind: BindingKind): TSchema {
  const action =
    mode === "canonical"
      ? Type.Ref("#/$defs/CanonicalSingleAction")
      : Type.Ref("#/$defs/TomlSingleAction");

  return Type.Unsafe<TSchema>({
    title: "Binding node",
    description: "Maps input combinations to actions.",
    type: "object",
    patternProperties: {
      [BINDING_KEY_PATTERNS[kind]]: action,
    },
    additionalProperties: false,
  });
}

export function bindingDefs(mode: SchemaMode): Record<string, TSchema> {
  const plain = {
    MouseBindingNode: plainBindingNode(mode, "mouse"),
    AxisBindingNode: plainBindingNode(mode, "axis"),
    GestureBindingNode: plainBindingNode(mode, "gesture"),
    SwitchBindingNode: plainBindingNode(mode, "switch"),
  };

  if (mode === "toml") {
    return {
      KeyBindingNode: tomlKeyBindingNode(),
      KeyConflictBindingNode: tomlKeyConflictBindingNode(),
      ...plain,
    };
  }

  return {
    KeyBindingNode: canonicalKeyBindingNode(0),
    KeySymBindingNode: canonicalKeyBindingNode(1),
    KeyLockBindingNode: canonicalKeyBindingNode(2),
    KeyReleaseBindingNode: canonicalKeyBindingNode(3),
    KeyPassBindingNode: canonicalKeyBindingNode(4),
    KeyConflictBindingNode: canonicalKeyBindingNode(5),
    ...plain,
  };
}
