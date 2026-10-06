import { CropShot } from "../../components/CropShot";
import type { Plate } from "./data";

export function PlateStage({ plate }: { plate: Plate }) {
  if (plate.kind === "shot") {
    return <CropShot shot={plate.shot} className="rb-shot" style={{ maxWidth: plate.shot.crop.w }} />;
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
