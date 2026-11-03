import { DISPATCHERS } from "@mangowm.github.io/schema";

import type { Action } from "./types";
import { ValueError, variableName } from "./value";

/** Parse the action part of a binding: `dispatcher,args` or a variable reference. */
export function parseAction(text: string): Action {
  const value = text.trim();
  const comma = value.indexOf(",");
  const head = (comma === -1 ? value : value.slice(0, comma)).trim();
  const args = comma === -1 ? "" : value.slice(comma + 1).trim();

  const name = variableName(head);
  if (name) return args ? { variable: name, args } : { variable: name };

  if (!(DISPATCHERS as readonly string[]).includes(head)) {
    throw new ValueError(`unknown dispatcher "${head}"`);
  }

  return args ? { dispatcher: head, args } : { dispatcher: head };
}

/** Format an action back to `dispatcher,args`. */
export function formatAction(action: Action): string {
  const head = "dispatcher" in action ? action.dispatcher : `$${action.variable}`;
  return action.args ? `${head},${action.args}` : head;
}
