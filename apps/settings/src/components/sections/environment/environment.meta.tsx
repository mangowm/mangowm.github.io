import { FileJsonIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { EnvironmentPanel } from "./EnvironmentPanel";

export const environmentMeta: SectionMeta = {
  id: "environment",
  label: "Environment Variables",
  icon: <FileJsonIcon />,
  panel: EnvironmentPanel,
  keywords: ["env", "variables", "wayland", "session", "globals"],
  fields: [
    {
      configKey: "env",
    },
  ],
};
