// Derived from src/config/binding_parse.c parse_func_name and docs/bindings/keys.md.
import type { DispatcherName } from "./dispatchers";
import { LAYOUTS } from "./layouts";

export type DispatcherArgKind =
  | "direction"
  | "circle"
  | "overcircle"
  | "int"
  | "uint"
  | "float"
  | "bool"
  | "tag-mask"
  | "layout"
  | "monitor"
  | "string"
  | "free"
  | "mouse-action"
  | "force"
  | "switcher"
  | "on-off"
  | "prev-next"
  | "index100"
  | "unit-float";

function ci(value: string): string {
  return value
    .split("")
    .map((char) => (/[a-z]/.test(char) ? `[${char}${char.toUpperCase()}]` : char))
    .join("");
}

const DIRECTION = `(?:${[ci("left"), ci("right"), ci("up"), ci("down"), ci("alldir")].join("|")})`;
const CIRCLE = `(?:${[ci("next"), ci("prev")].join("|")})`;
const OVERCIRCLE = `(?:${[ci("next"), ci("prev"), ci("current_next"), ci("current_prev")].join(
  "|",
)})`;
const MOUSE_ACTION = `(?:${[ci("curmove"), ci("curresize"), ci("curnormal"), ci("curpressed")].join(
  "|",
)})`;
const FORCE = `(?:${[ci("force"), ci("unforce")].join("|")})`;
const SWITCHER = "(?:next|prev|all_next|all_prev|all_tag_next|all_tag_prev)";
const ON_OFF = "(?:on|off|toggle)";
const PREV_NEXT = "(?:prev|next)";
const TAG_NUMBER = "(?:-1|00|[0-9]|[12][0-9]|3[01])";
const TAG_MASK = `${TAG_NUMBER}(?:\\|${TAG_NUMBER})*`;

const ARG_PATTERNS: Record<DispatcherArgKind, string> = {
  direction: DIRECTION,
  circle: CIRCLE,
  overcircle: OVERCIRCLE,
  int: "[+-]?[0-9]+",
  uint: "[+]?[0-9]+",
  float: "[+-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)",
  bool: "[01]",
  "tag-mask": TAG_MASK,
  layout: `(?:${LAYOUTS.join("|")})`,
  monitor: "[^,]+",
  string: "[^,]+",
  free: ".*",
  "mouse-action": MOUSE_ACTION,
  force: FORCE,
  switcher: SWITCHER,
  "on-off": ON_OFF,
  "prev-next": PREV_NEXT,
  index100: "(?:[0-9]|[1-9][0-9]|100)",
  "unit-float": "[+]?(?:0(?:\\.[0-9]+)?|1(?:\\.0+)?)",
};

export const DISPATCHER_ARGS: Record<DispatcherName, readonly DispatcherArgKind[]> = {
  centerwin: [],
  chvt: ["uint"],
  comboview: ["tag-mask"],
  create_virtual_output: ["string"],
  destroy_all_virtual_output: [],
  disable_monitor: ["monitor"],
  dwindle_split_horizontal: [],
  dwindle_split_vertical: [],
  dwindle_toggle_current_split: [],
  dwindle_toggle_split_direction: [],
  enable_monitor: ["monitor"],
  enteroverview: [],
  exchange_client: ["direction"],
  exchange_stack_client: ["circle"],
  focusdir: ["direction"],
  focusid: [],
  focuslast: [],
  focusmon: ["monitor"],
  focusstack: ["circle"],
  focus_window_or_workspace: ["direction"],
  groupfocus: ["circle"],
  groupjoin: ["direction"],
  groupleave: [],
  incgaps: ["int"],
  incnmaster: ["int"],
  killclient: ["force"],
  leaveoverview: [],
  load_config_file: ["string"],
  minimized: [],
  move_client: ["direction"],
  moveresize: ["mouse-action"],
  movewin: ["int", "int"],
  overcircle: ["overcircle"],
  quit: [],
  reload_config: [],
  resizewin: ["int", "int"],
  restore_minimized: [],
  scroller_stack: ["direction"],
  setkeymode: ["string"],
  setlayout: ["layout"],
  setmfact: ["float"],
  setoption: ["string", "free"],
  set_proportion: ["unit-float"],
  sleep_monitor: ["monitor"],
  sleep_toggle_monitor: ["monitor"],
  smartkillclient: [],
  smartmovewin: ["direction"],
  smartresizewin: ["direction"],
  spawn: ["free"],
  spawn_on_empty: ["string", "tag-mask"],
  spawn_shell: ["free"],
  switcher: ["switcher"],
  switch_keyboard_layout: ["index100"],
  switch_layout: [],
  switch_proportion_preset: ["circle"],
  tag: ["tag-mask", "bool"],
  tagcrossmon: ["tag-mask", "monitor"],
  tagmon: ["monitor", "bool"],
  tagsilent: ["tag-mask"],
  tag_special_silent: [],
  tag_special_tag: [],
  tagtoleft: ["bool"],
  tagtoright: ["bool"],
  toggle_all_floating: [],
  togglefakefullscreen: [],
  togglefloating: [],
  togglefullscreen: [],
  togglegaps: [],
  toggleglobal: [],
  togglegroupbar: [],
  togglehdr: ["on-off", "monitor"],
  togglejump: [],
  togglemaximizescreen: [],
  toggle_monitor: ["monitor"],
  toggle_named_scratchpad: ["string", "string", "string"],
  toggleoverlay: [],
  toggleoverview: ["bool"],
  toggle_render_border: [],
  toggle_scratchpad: [],
  toggle_special_tag: [],
  toggletag: ["tag-mask"],
  toggle_trackpad_enable: [],
  toggleview: ["tag-mask"],
  view: ["tag-mask", "bool"],
  viewcrossmon: ["tag-mask", "monitor"],
  view_insert: ["prev-next"],
  viewnext_have_client: ["bool"],
  viewprev_have_client: ["bool"],
  viewtoleft: ["bool"],
  viewtoleft_have_client: ["bool"],
  viewtoright: ["bool"],
  viewtoright_have_client: ["bool"],
  wakeup_monitor: ["monitor"],
  zoom: [],
};

export function argSequencePattern(args: readonly DispatcherArgKind[], optional: boolean): string {
  let tail = "";
  for (let index = args.length - 1; index >= 0; index -= 1) {
    const pattern = ARG_PATTERNS[args[index]];
    tail = `(?:\\s*,\\s*(?:${pattern})?${tail})${optional ? "?" : ""}`;
  }
  return tail;
}

export function tomlActionPattern(name: DispatcherName): string {
  const args = DISPATCHER_ARGS[name];
  if (args.length === 0) return `${name}(?:\\s*,\\s*(?:0)?)?`;
  return `${name}${argSequencePattern(args, true)}`;
}

export function canonicalArgsPattern(name: DispatcherName): string {
  const args = DISPATCHER_ARGS[name];
  if (args.length === 0) return "^\\s*(?:0)?\\s*$";
  return `^\\s*(?:${ARG_PATTERNS[args[0]]}${argSequencePattern(args.slice(1), true)})?\\s*$`;
}
