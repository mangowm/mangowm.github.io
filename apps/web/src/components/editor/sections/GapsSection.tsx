"use client";

import { ConfigSection } from "../ui/ConfigSection";
import { SliderRow } from "../ui/SliderRow";
import type { LayoutParams } from "../types";

interface Props {
  params: LayoutParams;
  onUpdate: (u: Partial<LayoutParams>) => void;
}

export function GapsSection({ params, onUpdate }: Props) {
  const px = (v: number) => `${v}px`;
  return (
    <ConfigSection title="Gaps">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <SliderRow
          label="Outer H"
          value={params.gapOuterH}
          min={0}
          max={40}
          step={5}
          onChange={(v) => onUpdate({ gapOuterH: v })}
          formatValue={px}
        />
        <SliderRow
          label="Outer V"
          value={params.gapOuterV}
          min={0}
          max={40}
          step={5}
          onChange={(v) => onUpdate({ gapOuterV: v })}
          formatValue={px}
        />
        <SliderRow
          label="Inner H"
          value={params.gapInnerH}
          min={0}
          max={40}
          step={5}
          onChange={(v) => onUpdate({ gapInnerH: v })}
          formatValue={px}
        />
        <SliderRow
          label="Inner V"
          value={params.gapInnerV}
          min={0}
          max={40}
          step={5}
          onChange={(v) => onUpdate({ gapInnerV: v })}
          formatValue={px}
        />
      </div>
    </ConfigSection>
  );
}
