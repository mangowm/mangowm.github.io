import type { PanelProps } from "@/lib/presentation/section-types";
import { PanelHeader, PanelShell } from "@/components/primitives/section-ui";

export function TabletPanel(_props: PanelProps) {
  return (
    <PanelShell>
      <PanelHeader title="Tablet" description="Graphics tablet configuration." separator={false} />

      <div className="rounded-xl border border-dashed border-border/60 bg-muted/5 px-6 py-12 text-center">
        <h3 className="text-sm font-medium text-foreground">Tablet mapping uses device rules</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          A device rule with <code className="font-mono">type:tablet</code> pins the device to a
          monitor or makes it follow the focused monitor.
        </p>
      </div>
    </PanelShell>
  );
}
