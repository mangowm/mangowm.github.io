import { Tags } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { TagRulesPanel } from "./TagRulesPanel";

export const tagRulesMeta: SectionMeta = {
  id: "tag-rules",
  label: "Tag Rules",
  icon: <Tags />,
  parentId: "rules",
  panel: TagRulesPanel,
  keywords: ["tag", "workspace", "layout", "nmaster", "mfact", "floating", "border", "hide"],
};
