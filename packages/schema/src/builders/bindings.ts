import Type, { type TSchema } from "typebox";

import { BINDING_KEY_PATTERNS, type BindingKind } from "../data/bindingKeys";

const KEY_FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const KEY_FLAG_DEFS = [
  "KeyBindingNode",
  "KeySymBindingNode",
  "KeyLockBindingNode",
  "KeyReleaseBindingNode",
  "KeyPassBindingNode",
  "KeyConflictBindingNode",
] as const;

function keyBindingNode(start: number): TSchema {
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
      ? Type.Ref("#/$defs/ConflictActions")
      : Type.Ref("#/$defs/SingleAction");

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

function plainBindingNode(kind: BindingKind): TSchema {
  return Type.Unsafe<TSchema>({
    title: "Binding node",
    description: "Maps input combinations to actions.",
    type: "object",
    patternProperties: {
      [BINDING_KEY_PATTERNS[kind]]: Type.Ref("#/$defs/SingleAction"),
    },
    additionalProperties: false,
  });
}

export function bindingDefs(): Record<string, TSchema> {
  return {
    KeyBindingNode: keyBindingNode(0),
    KeySymBindingNode: keyBindingNode(1),
    KeyLockBindingNode: keyBindingNode(2),
    KeyReleaseBindingNode: keyBindingNode(3),
    KeyPassBindingNode: keyBindingNode(4),
    KeyConflictBindingNode: keyBindingNode(5),
    MouseBindingNode: plainBindingNode("mouse"),
    AxisBindingNode: plainBindingNode("axis"),
    GestureBindingNode: plainBindingNode("gesture"),
    SwitchBindingNode: plainBindingNode("switch"),
  };
}
