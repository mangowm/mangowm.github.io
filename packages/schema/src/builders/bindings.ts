import Type, { type TSchema } from "typebox";

import { BINDING_KEY_PATTERNS, type BindingKind } from "../data/bindingKeys";

const KEY_FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const FLAG_DEFS: Record<(typeof KEY_FLAGS)[number], string> = {
  sym: "KeySymBindingNode",
  lock: "KeyLockBindingNode",
  release: "KeyReleaseBindingNode",
  pass: "KeyPassBindingNode",
  conflict: "KeyConflictBindingNode",
};

const BINDING_DEFS: Record<BindingKind, string> = {
  key: "KeyBindingNode",
  mouse: "MouseBindingNode",
  axis: "AxisBindingNode",
  gesture: "GestureBindingNode",
  switch: "SwitchBindingNode",
};

function keyBindingNode(start: number): TSchema {
  const allowed = KEY_FLAGS.map((flag, index) => [flag, index] as const).filter(
    ([, index]) => index >= start,
  );
  const flagProperties = Object.fromEntries(
    allowed.map(([flag]) => [flag, Type.Ref(`#/$defs/${FLAG_DEFS[flag]}`)]),
  );
  const flagPatterns = Object.fromEntries(
    allowed.map(([flag]) => [`^${flag}$`, Type.Ref(`#/$defs/${FLAG_DEFS[flag]}`)]),
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

export function bindingMap(kind: BindingKind, title: string, description: string): TSchema {
  return Type.Record(Type.String(), Type.Ref(`#/$defs/${BINDING_DEFS[kind]}`), {
    title,
    description,
  });
}

export function bindingDefs(): Record<string, TSchema> {
  const plain = Object.fromEntries(
    (["mouse", "axis", "gesture", "switch"] as const).map((kind) => [
      BINDING_DEFS[kind],
      plainBindingNode(kind),
    ]),
  );

  return {
    [BINDING_DEFS.key]: keyBindingNode(0),
    KeySymBindingNode: keyBindingNode(1),
    KeyLockBindingNode: keyBindingNode(2),
    KeyReleaseBindingNode: keyBindingNode(3),
    KeyPassBindingNode: keyBindingNode(4),
    KeyConflictBindingNode: keyBindingNode(5),
    ...plain,
  };
}
