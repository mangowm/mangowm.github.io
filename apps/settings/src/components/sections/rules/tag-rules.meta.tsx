import { Tags } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TagRulesPanel } from "./TagRulesPanel";

export const tagRulesMeta: SectionMeta = {
  id: "tag-rules",
  label: "Tag Rules",
  icon: <Tags />,
  parentId: "rules",
  panel: TagRulesPanel,
  keywords: ["tag", "tag", "layout", "master_count", "master_factor", "floating", "border", "hide"],
};
