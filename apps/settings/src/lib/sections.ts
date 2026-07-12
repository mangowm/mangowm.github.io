import type { SectionMeta } from "./section-types";

import { autostartMeta } from "@/components/sections/autostart/autostart.meta";
import { environmentMeta } from "@/components/sections/environment/environment.meta";
import { appearanceMeta } from "@/components/sections/appearance/appearance.meta";
import { colorsMeta } from "@/components/sections/colors/colors.meta";
import { windowEffectsMeta } from "@/components/sections/window-effects/window-effects.meta";
import { gapsBordersMeta } from "@/components/sections/gaps-borders/gaps-borders.meta";
import { cursorMeta } from "@/components/sections/cursor/cursor.meta";
import { groupBarMeta } from "@/components/sections/appearance/group-bar/group-bar.meta";
import { jumpLabelMeta } from "@/components/sections/appearance/jump-label/jump-label.meta";
import { layoutMeta } from "@/components/sections/layout/layout.meta";
import { tilingMeta } from "@/components/sections/layout/tiling.meta";
import { dwindleMeta } from "@/components/sections/layout/dwindle.meta";
import { scrollerMeta } from "@/components/sections/layout/scroller.meta";
import { overviewMeta } from "@/components/sections/layout/overview.meta";
import { inputDevicesMeta } from "@/components/sections/input-devices/input-devices.meta";
import { keyboardMeta } from "@/components/sections/input-devices/keyboard/keyboard.meta";
import { pointerMeta } from "@/components/sections/input-devices/pointer/pointer.meta";
import { trackpadMeta } from "@/components/sections/input-devices/trackpad/trackpad.meta";

import { tabletMeta } from "@/components/sections/input-devices/tablet/tablet.meta";
import { bindingsMeta } from "@/components/sections/bindings/bindings.meta";
import { animationsMeta } from "@/components/sections/animations/animations.meta";
import { generalMeta } from "@/components/sections/animations/general/general.meta";
import { timingMeta } from "@/components/sections/animations/timing/timing.meta";
import { curvesMeta } from "@/components/sections/animations/curves/curves.meta";

import { behaviourMeta } from "@/components/sections/behaviour/behaviour.meta";
import { focusMeta } from "@/components/sections/behaviour/focus/focus.meta";
import { dragMeta } from "@/components/sections/behaviour/drag/drag.meta";
import { scratchpadMeta } from "@/components/sections/behaviour/scratchpad/scratchpad.meta";
import { tagsMeta } from "@/components/sections/behaviour/tags/tags.meta";
import { securityMeta } from "@/components/sections/behaviour/security/security.meta";
import { idleMeta } from "@/components/sections/behaviour/idle/idle.meta";
import { renderingMeta } from "@/components/sections/behaviour/rendering/rendering.meta";
import { xwaylandMeta } from "@/components/sections/behaviour/xwayland/xwayland.meta";

import { rulesMeta } from "@/components/sections/rules/rules.meta";
import { windowRulesMeta } from "@/components/sections/rules/window-rules.meta";
import { monitorRulesMeta } from "@/components/sections/rules/monitor-rules.meta";
import { tagRulesMeta } from "@/components/sections/rules/tag-rules.meta";
import { layerRulesMeta } from "@/components/sections/rules/layer-rules.meta";

export const SECTIONS: SectionMeta[] = [
  autostartMeta,
  environmentMeta,
  bindingsMeta,
  appearanceMeta,
  colorsMeta,
  windowEffectsMeta,
  gapsBordersMeta,
  groupBarMeta,
  jumpLabelMeta,
  cursorMeta,
  layoutMeta,
  tilingMeta,
  dwindleMeta,
  scrollerMeta,
  overviewMeta,
  inputDevicesMeta,
  keyboardMeta,
  pointerMeta,
  trackpadMeta,
  tabletMeta,
  animationsMeta,
  generalMeta,
  timingMeta,
  curvesMeta,

  behaviourMeta,
  focusMeta,
  dragMeta,
  scratchpadMeta,
  tagsMeta,
  securityMeta,
  idleMeta,
  renderingMeta,
  xwaylandMeta,

  rulesMeta,
  monitorRulesMeta,
  tagRulesMeta,
  windowRulesMeta,
  layerRulesMeta,
];

export function getSectionById(id: string): SectionMeta | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionMeta[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
