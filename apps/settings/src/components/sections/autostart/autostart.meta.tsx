import { RocketIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { AutostartPanel } from "./AutostartPanel";

export const autostartMeta: SectionMeta = {
  id: "autostart",
  label: "Autostart",
  icon: <RocketIcon />,
  panel: AutostartPanel,
  keywords: ["startup", "execute", "command", "launch", "boot", "run"],
  fields: [], // user-defined; indexed dynamically via DYNAMIC_SOURCES
};
