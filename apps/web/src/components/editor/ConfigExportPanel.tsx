"use client";

import { useMemo, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

function boolToInt(v: boolean): string {
  return v ? "1" : "0";
}

function generateConfig(params: {
  smartGaps: boolean;
  gapOuterH: number;
  gapOuterV: number;
  gapInnerH: number;
  gapInnerV: number;
  masterCount: number;
  masterFactor: number;
  centerMasterOverspread: boolean;
  centerWhenSingleStack: boolean;
  scrollerStructs: number;
  scrollerDefaultProportion: number;
  scrollerDefaultProportionSingle: number;
  scrollerIgnoreSingle: boolean;
  scrollerFocusCenter: boolean;
  scrollerPreferCenter: boolean;
  scrollerPreferOverspread: boolean;
  overviewGapInner: number;
  overviewGapOuter: number;
}, monitor: {
  width: number;
  height: number;
  scale: number;
}): string {
  const lines: string[] = [];

  lines.push("# Monitor");
  lines.push(`monitorrule=name:DP-1,width:${monitor.width},height:${monitor.height},scale:${monitor.scale},refresh:60,x:0,y:0,vrr:0,rr:0`);

  lines.push("");
  lines.push("# Gaps");
  lines.push(`smartgaps = ${boolToInt(params.smartGaps)}`);
  lines.push(`gappih = ${params.gapInnerH}`);
  lines.push(`gappiv = ${params.gapInnerV}`);
  lines.push(`gappoh = ${params.gapOuterH}`);
  lines.push(`gappov = ${params.gapOuterV}`);

  lines.push("");
  lines.push("# Master");
  lines.push(`default_nmaster = ${params.masterCount}`);
  lines.push(`default_mfact = ${params.masterFactor.toFixed(2)}`);

  lines.push("");
  lines.push("# Center Tile");
  lines.push(`center_master_overspread = ${boolToInt(params.centerMasterOverspread)}`);
  lines.push(`center_when_single_stack = ${boolToInt(params.centerWhenSingleStack)}`);

  lines.push("");
  lines.push("# Scroller");
  lines.push(`scroller_structs = ${params.scrollerStructs}`);
  lines.push(`scroller_default_proportion = ${params.scrollerDefaultProportion.toFixed(2)}`);
  lines.push(`scroller_default_proportion_single = ${params.scrollerDefaultProportionSingle.toFixed(2)}`);
  lines.push(`scroller_ignore_proportion_single = ${boolToInt(params.scrollerIgnoreSingle)}`);
  lines.push(`scroller_focus_center = ${boolToInt(params.scrollerFocusCenter)}`);
  lines.push(`scroller_prefer_center = ${boolToInt(params.scrollerPreferCenter)}`);
  lines.push(`scroller_prefer_overspread = ${boolToInt(params.scrollerPreferOverspread)}`);

  lines.push("");
  lines.push("# Overview");
  lines.push(`overviewgappi = ${params.overviewGapInner}`);
  lines.push(`overviewgappo = ${params.overviewGapOuter}`);

  return lines.join("\n");
}

interface ConfigExportPanelProps {
  params: {
    smartGaps: boolean;
    gapOuterH: number;
    gapOuterV: number;
    gapInnerH: number;
    gapInnerV: number;
    masterCount: number;
    masterFactor: number;
    centerMasterOverspread: boolean;
    centerWhenSingleStack: boolean;
    scrollerStructs: number;
    scrollerDefaultProportion: number;
    scrollerDefaultProportionSingle: number;
    scrollerIgnoreSingle: boolean;
    scrollerFocusCenter: boolean;
    scrollerPreferCenter: boolean;
    scrollerPreferOverspread: boolean;
    overviewGapInner: number;
    overviewGapOuter: number;
  };
  monitor: {
    width: number;
    height: number;
    scale: number;
  };
}

export function ConfigExportPanel({ params, monitor }: ConfigExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => generateConfig(params, monitor), [params, monitor]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [config]);

  return (
    <aside className="flex w-72 flex-shrink-0 flex-col border-l bg-muted/10">
      <div className="border-b px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Config Export
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <pre className="p-4 font-mono text-sm leading-relaxed text-foreground whitespace-pre">
            {config}
          </pre>
        </ScrollArea>
      </div>

      <div className="border-t p-3">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-sm"
          onClick={handleCopy}
        >
          {copied ? "✓ Copied!" : "Copy to clipboard"}
        </Button>
      </div>
    </aside>
  );
}
