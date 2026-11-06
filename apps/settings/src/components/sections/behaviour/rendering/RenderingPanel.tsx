import { useConfigStore, useConfigBool, useConfigStr } from "@/lib/config/store";
import { globalOptions } from "@/lib/config/schema-meta";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SelectRow,
} from "@/components/primitives/section-ui";

const TEARING_OPTIONS = globalOptions("allow_tearing") ?? [];
const HDR_OPTIONS = globalOptions("hdr_depth") ?? [];

export function RenderingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const tearing = useConfigStr("allow_tearing");
  const syncobj = useConfigBool("sync_obj_enable");
  const hdrDepth = useConfigStr("hdr_depth");

  return (
    <PanelShell>
      <PanelHeader
        title="Rendering"
        description="Configure display rendering behaviour — tearing control, GPU sync, and HDR output."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Tearing">
          <div ref={fieldRef("allow_tearing")}>
            <SelectRow
              label="Allow Tearing"
              description="Reduce input latency by permitting screen tearing. Disabled = smooth (vsync), Always = maximum responsiveness, Fullscreen Only = compromise for games and video."
              value={tearing}
              options={TEARING_OPTIONS}
              onChange={(v) => setValue("allow_tearing", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="GPU Synchronisation">
          <div ref={fieldRef("sync_obj_enable")}>
            <ToggleRow
              label="Sync Object Enable"
              description="Enable DRM sync object timeline support. May improve GPU scheduling on compatible hardware."
              value={syncobj}
              onChange={tb("sync_obj_enable")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="HDR">
          <div ref={fieldRef("hdr_depth")}>
            <SelectRow
              label="HDR Bit Depth"
              description="Output bit depth for HDR rendering. 10-bit is recommended for HDR displays; 8-bit for SDR fallback; Default uses the compositor-preferred setting."
              value={hdrDepth}
              options={HDR_OPTIONS}
              onChange={(v) => setValue("hdr_depth", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
