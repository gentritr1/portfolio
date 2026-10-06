import { forwardRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { CropShot } from "../../components/CropShot";
import { REAL_SCREENS } from "../../content/careShots";
import type { Change, Plate } from "./data";
import { ease } from "./motion";

interface PlateProps {
  id: string;
  number: string;
  change: Change;
  plate: Plate;
  instant: boolean;
}

function Stage({ plate }: { plate: Plate }) {
  if (plate.kind === "shot") {
    return <CropShot shot={plate.shot} className="cl-shot" style={{ maxWidth: plate.shot.crop.w }} />;
  }
  return (
    <div className={`cl-shots cl-shots-${plate.kind}`} data-count={plate.images.length}>
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

export const PlateView = forwardRef<HTMLElement, PlateProps>(function PlateView(
  { id, number, change, plate, instant },
  ref,
) {
  return (
    <motion.figure
      ref={ref}
      id={id}
      className="cl-plate"
      data-kind={plate.kind}
      initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{
        opacity: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        transition: { duration: instant ? 0 : 0.16, ease: ease.out },
      }}
      transition={{ duration: instant ? 0 : 0.42, ease: ease.out }}
    >
      <Stage plate={plate} />
      <figcaption className="cl-caption">
        <span className="cl-caption-no">Plate {number}</span>
        <span className="cl-caption-text">
          {plate.title}.{" "}
          {plate.kind === "shot" ? REAL_SCREENS : "Screens from public pages."}
        </span>
        {(change.caseSlug || change.links?.length) && (
          <span className="cl-caption-links">
            {change.caseSlug && (
              <Link to={`/work/${change.caseSlug}`}>
                Read the case
                <ArrowRightIcon aria-hidden="true" weight="regular" />
              </Link>
            )}
            {change.links?.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ArrowUpRightIcon aria-hidden="true" weight="regular" />
              </a>
            ))}
          </span>
        )}
      </figcaption>
    </motion.figure>
  );
});
