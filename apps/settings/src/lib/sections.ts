import type { SectionMeta } from "./section-types";

import { autostartMeta }     from "@/components/sections/autostart/autostart.meta";
import { environmentMeta }   from "@/components/sections/environment/environment.meta";
import { appearanceMeta }    from "@/components/sections/appearance/appearance.meta";
import { colorsMeta }        from "@/components/sections/colors/colors.meta";
import { windowEffectsMeta } from "@/components/sections/window-effects/window-effects.meta";
import { gapsBordersMeta }   from "@/components/sections/gaps-borders/gaps-borders.meta";
import { layoutMeta }        from "@/components/sections/layout/layout.meta";
import { tilingMeta }        from "@/components/sections/layout/tiling.meta";
import { dwindleMeta }       from "@/components/sections/layout/dwindle.meta";
import { scrollerMeta }      from "@/components/sections/layout/scroller.meta";

export const SECTIONS: SectionMeta[] = [
  autostartMeta,
  environmentMeta,
  appearanceMeta,
  colorsMeta,
  windowEffectsMeta,
  gapsBordersMeta,
  layoutMeta,
  tilingMeta,
  dwindleMeta,
  scrollerMeta,
];

export function getSectionById(id: string): SectionMeta | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionMeta[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
