import { Suspense, type CSSProperties } from "react";
import { recreations } from "../../lib/recreations";
import type { Plate } from "./data";

export function PlateStage({ plate }: { plate: Plate }) {
  if (plate.kind === "recreation") {
    const entry = recreations[plate.recreation];
    const Recreation = entry.Component;
    const style = {
      "--a-base": entry.aspect.base,
      "--a-sm": entry.aspect.sm,
      "--a-lg": entry.aspect.lg,
    } as CSSProperties;
    return (
      <div className="rb-stage" data-world={entry.world} style={style}>
        <Suspense fallback={<img className="rb-stage-poster" src={plate.thumb} alt="" />}>
          <Recreation />
        </Suspense>
      </div>
    );
  }
  return (
    <div className={`rb-shots rb-shots-${plate.kind}`} data-count={plate.images.length}>
      {plate.images.map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          width={plate.kind === "phone" ? 780 : 1440}
          height={plate.kind === "phone" ? 1689 : 900}
        />
      ))}
    </div>
  );
}
