import type { ComponentType } from "react";
import { FileJsonIcon, PaintbrushIcon, PaletteIcon, RocketIcon, Blend, Grid3x3, LayoutGridIcon, PanelLeftIcon, SplitSquareHorizontalIcon, GalleryHorizontalEndIcon } from "lucide-react";
import { AutostartPanel } from "@/components/sections/autostart/AutostartPanel";
import { EnvironmentPanel } from "@/components/sections/environment/EnvironmentPanel";
import { ColorsPanel } from "@/components/sections/colors/ColorsPanel";
import { WindowEffectsPanel } from "@/components/sections/window-effects/WindowEffectsPanel";
import { GapsBordersPanel } from "@/components/sections/gaps-borders/GapsBordersPanel";
import { TilingPanel } from "@/components/sections/layout/TilingPanel";
import { DwindlePanel } from "@/components/sections/layout/DwindlePanel";
import { ScrollerPanel } from "@/components/sections/layout/ScrollerPanel";

export interface FieldDef {
  configKey: string;
  label: string;
  description?: string;
}

export interface SectionDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  panel?: ComponentType;
  parentId?: string;
  keywords?: string[];
  fields?: FieldDef[];
}

export const SECTIONS: SectionDef[] = [
  {
    id: "autostart",
    label: "Autostart",
    icon: <RocketIcon />,
    panel: AutostartPanel,
    keywords: ["startup", "execute", "command", "launch", "boot"],
    fields: [
      { configKey: "exec-once", label: "exec-once", description: "Commands that run only once on compositor launch" },
      { configKey: "exec", label: "exec", description: "Commands that execute on every config reload" },
    ],
  },
  {
    id: "environment",
    label: "Environment Variables",
    icon: <FileJsonIcon />,
    panel: EnvironmentPanel,
    keywords: ["env", "variables", "wayland", "session", "globals"],
    fields: [
      { configKey: "env", label: "Environment Variable", description: "Key-value pairs injected into the session" },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <PaintbrushIcon />,
    keywords: ["theme", "visual", "style", "colors", "effects"],
  },
  {
    id: "colors",
    label: "Colors",
    icon: <PaletteIcon />,
    panel: ColorsPanel,
    parentId: "appearance",
    keywords: ["palette", "theme", "colour", "background", "border"],
    fields: [
      { configKey: "rootcolor", label: "Root Background", description: "Desktop background behind all windows" },
      { configKey: "bordercolor", label: "Inactive Border", description: "Unfocused window border (non-selected monitor)" },
      { configKey: "focuscolor", label: "Active Border", description: "Focused window border on the selected monitor" },
      { configKey: "maximizescreencolor", label: "Maximize Screen", description: "Border when window is focused and maximized" },
      { configKey: "urgentcolor", label: "Urgent", description: "Urgent window border — overrides all other colors" },
      { configKey: "scratchpadcolor", label: "Scratchpad", description: "Border when focused and scratchpad window" },
      { configKey: "globalcolor", label: "Global", description: "Border when focused and toggleglobal window" },
      { configKey: "overlaycolor", label: "Overlay", description: "Border when focused and toggleoverlay window" },
      { configKey: "dropcolor", label: "Drop Shadow", description: "Drop-shadow rectangle when dragging floating windows" },
      { configKey: "splitcolor", label: "Split Indicator", description: "Dwindle manual-split guide line" },
      { configKey: "shadowscolor", label: "Shadow", description: "Drop shadow color for windows" },
    ],
  },
  {
    id: "window-effects",
    label: "Window Effects",
    icon: <Blend />,
    panel: WindowEffectsPanel,
    parentId: "appearance",
    keywords: ["blur", "shadows", "opacity", "transparency", "radius", "corners", "visual"],
    fields: [
      { configKey: "blur", label: "Enable Blur", description: "Toggle background blur behind windows" },
      { configKey: "blur_layer", label: "Blur Layer Surfaces", description: "Apply blur to layer-shell surfaces (panels, notifications)" },
      { configKey: "blur_optimized", label: "Optimized Blur", description: "Use a faster blur algorithm" },
      { configKey: "blur_params_num_passes", label: "Blur Passes", description: "Number of blur iterations" },
      { configKey: "blur_params_radius", label: "Blur Radius", description: "Pixel radius of the blur kernel" },
      { configKey: "blur_params_noise", label: "Blur Noise", description: "Grain to reduce banding artifacts" },
      { configKey: "blur_params_brightness", label: "Blur Brightness", description: "Brightness multiplier for the blurred layer" },
      { configKey: "blur_params_contrast", label: "Blur Contrast", description: "Contrast multiplier for the blurred layer" },
      { configKey: "blur_params_saturation", label: "Blur Saturation", description: "Saturation multiplier for the blurred layer" },
      { configKey: "border_radius", label: "Border Radius", description: "Corner rounding in pixels" },
      { configKey: "border_radius_location_default", label: "Affected Corners", description: "Which corners receive the radius" },
      { configKey: "focused_opacity", label: "Focused Opacity", description: "Opacity of the currently focused window" },
      { configKey: "unfocused_opacity", label: "Unfocused Opacity", description: "Opacity of unfocused background windows" },
      { configKey: "shadows", label: "Enable Shadows", description: "Render drop shadows behind windows" },
      { configKey: "shadow_only_floating", label: "Shadows Floating Only", description: "Only draw shadows for floating windows" },
      { configKey: "layer_shadows", label: "Layer Shadow Surfaces", description: "Draw shadows under layer-shell surfaces" },
      { configKey: "shadows_size", label: "Shadow Size", description: "How far the shadow extends beyond window edges" },
      { configKey: "shadows_blur", label: "Shadow Softness", description: "Gaussian blur sigma for softer shadows" },
      { configKey: "shadows_position_x", label: "Shadow Offset X", description: "Horizontal shadow offset" },
      { configKey: "shadows_position_y", label: "Shadow Offset Y", description: "Vertical shadow offset" },
    ],
  },
  {
    id: "gaps-borders",
    label: "Gaps & Borders",
    icon: <Grid3x3 />,
    panel: GapsBordersPanel,
    parentId: "appearance",
    keywords: ["spacing", "padding", "margin", "inner", "outer"],
    fields: [
      { configKey: "smartgaps", label: "Smart Gaps", description: "Only show gaps with multiple windows on the same tag" },
      { configKey: "gappih", label: "Inner Gap Horizontal", description: "Horizontal gap between tiled windows" },
      { configKey: "gappiv", label: "Inner Gap Vertical", description: "Vertical gap between tiled windows" },
      { configKey: "gappoh", label: "Outer Gap Horizontal", description: "Horizontal gap between windows and screen edges" },
      { configKey: "gappov", label: "Outer Gap Vertical", description: "Vertical gap between windows and screen edges" },
      { configKey: "borderpx", label: "Border Width", description: "Thickness of window borders in pixels" },
      { configKey: "no_border_when_single", label: "Hide Border When Solo", description: "Remove borders when only one window is visible" },
      { configKey: "no_radius_when_single", label: "Hide Radius When Solo", description: "Remove corner radius when only one window is visible" },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    icon: <LayoutGridIcon />,
    keywords: ["tiling", "master", "stack", "arrangement", "dwindle", "scroller"],
  },
  {
    id: "tiling",
    label: "Tiling",
    icon: <PanelLeftIcon />,
    panel: TilingPanel,
    parentId: "layout",
    keywords: ["master", "stack", "factor", "placement"],
    fields: [
      { configKey: "new_is_master", label: "New Windows as Master", description: "New windows open in the master area instead of the stack" },
      { configKey: "default_mfact", label: "Master Area Factor", description: "Proportion of screen width allocated to the master area" },
      { configKey: "default_nmaster", label: "Number of Masters", description: "How many windows are kept in the master area" },
      { configKey: "center_master_overspread", label: "Center Master Overspread", description: "Center the master window when it overspreads" },
      { configKey: "center_when_single_stack", label: "Center Single Stack", description: "Center the single window in the stack area" },
    ],
  },
  {
    id: "dwindle",
    label: "Dwindle",
    icon: <SplitSquareHorizontalIcon />,
    panel: DwindlePanel,
    parentId: "layout",
    keywords: ["split", "smart", "ratio", "direction"],
    fields: [
      { configKey: "dwindle_vsplit", label: "Vertical Split", description: "Policy for vertical splits in the dwindle layout" },
      { configKey: "dwindle_hsplit", label: "Horizontal Split", description: "Policy for horizontal splits in the dwindle layout" },
      { configKey: "dwindle_preserve_split", label: "Preserve Split", description: "Keep the current split direction when inserting" },
      { configKey: "dwindle_smart_split", label: "Smart Split", description: "Auto-choose split direction based on dimensions" },
      { configKey: "dwindle_smart_resize", label: "Smart Resize", description: "Intelligently resize adjacent windows" },
      { configKey: "dwindle_drop_simple_split", label: "Drop Simple Split", description: "Fall back to simple split when smart split can't decide" },
      { configKey: "dwindle_manual_split", label: "Manual Split", description: "Require explicit split direction input" },
      { configKey: "dwindle_split_ratio", label: "Split Ratio", description: "Proportion of space for the first child when splitting" },
    ],
  },
  {
    id: "scroller",
    label: "Scroller",
    icon: <GalleryHorizontalEndIcon />,
    panel: ScrollerPanel,
    parentId: "layout",
    keywords: ["scroll", "proportion", "focus", "edge", "structs"],
    fields: [
      { configKey: "scroller_default_proportion", label: "Default Proportion", description: "Default proportion of the container per tiled window" },
      { configKey: "scroller_default_proportion_single", label: "Single Window Proportion", description: "Proportion when only one window is on the tag" },
      { configKey: "scroller_ignore_proportion_single", label: "Ignore Proportion When Solo", description: "Ignore proportion setting when solo" },
      { configKey: "scroller_focus_center", label: "Focus Center", description: "Focus the window at the center of the viewport" },
      { configKey: "scroller_prefer_center", label: "Prefer Center", description: "Keep the focused window centered" },
      { configKey: "scroller_prefer_overspread", label: "Prefer Overspread", description: "Overspread windows across available space" },
      { configKey: "edge_scroller_pointer_focus", label: "Pointer Focus at Edge", description: "Auto-focus adjacent window at screen edge" },
      { configKey: "edge_scroller_focus_allow_speed", label: "Focus Allow Speed", description: "Max pointer speed for edge-triggered focus" },
      { configKey: "scroller_structs", label: "Scroller Structs", description: "Number of structural positions in the scroller" },
    ],
  },
];

export function getSectionById(id: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionDef[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
