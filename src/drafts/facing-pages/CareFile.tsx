import { useState } from "react";
import { motion } from "motion/react";
import { spring } from "./motion";
import { CropShot } from "../../components/CropShot";
import { careShots } from "../../content/careShots";

const shot = careShots.patients;

export function CareFile({
  reduced,
  language,
}: {
  reduced: boolean;
  language: "en" | "ar";
}) {
  const [preview, setPreview] = useState(false);
  const [open, setOpen] = useState(false);
  const ar = language === "ar";
  return (
    <figure className="fp-care-file">
      <motion.button
        type="button"
        className="fp-care-folder"
        aria-expanded={open}
        aria-label={
          ar
            ? "فتح أو إغلاق ملف المشروع الخاص"
            : "Open or close the private care case file"
        }
        onHoverStart={() => setPreview(true)}
        onHoverEnd={() => setPreview(false)}
        onFocus={() => setPreview(true)}
        onBlur={() => setPreview(false)}
        onClick={() => setOpen((value) => !value)}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={reduced ? { duration: 0.01 } : spring.ui}
      >
        <span className="fp-care-tab">
          {ar ? "عمل خاص / الرعاية الصحية" : "PRIVATE / CARE PLATFORM"}
        </span>
        <motion.span
          className="fp-care-paper"
          animate={{
            y: open ? -18 : preview ? -9 : 0,
            z: open ? 36 : 0,
            scale: open ? 1.05 : 1,
            rotateY: open ? 180 : 0,
          }}
          transition={reduced ? { duration: 0.01 } : spring.lift}
        >
          <span className="fp-care-front" aria-hidden={open}>
            <span className="fp-care-shot">
              <CropShot
                shot={shot}
                style={{
                  width: `min(100cqw, ${shot.crop.w / shot.crop.h} * 100cqh)`,
                }}
                alt={
                  ar
                    ? "حلقة إجمالي المرضى: 24 مريضاً في برامج RPM وCCM وRTM. بيانات مختلقة."
                    : shot.alt
                }
              />
            </span>
            <span>
              {ar
                ? "شاشات منتج حقيقية · بيانات مختلقة"
                : "Real product screens · invented data"}
            </span>
          </span>
          <span className="fp-care-back" aria-hidden={!open}>
            <strong>{ar ? "وثائق القرار" : "Decision records"}</strong>
            <span>
              {ar
                ? "قرارات البنية موثقة."
                : "Architecture decisions, written down."}
            </span>
            <strong>{ar ? "اختبارات تطابق" : "Parity tests"}</strong>
            <span>
              {ar
                ? "من Vue إلى React، مساراً بعد مسار."
                : "Vue to React, route by route."}
            </span>
            <strong dir="ltr">16 → 2</strong>
            <span>
              {ar
                ? "استعلامات تقرير فوترة في واجهة الرعاية المرتبطة."
                : "Queries in one billing report in the related care API."}
            </span>
          </span>
        </motion.span>
        <span className="fp-care-pocket">
          {open
            ? ar
              ? "إغلاق الملف"
              : "Close the case file"
            : ar
              ? "فتح ملف المشروع"
              : "Open the case file"}
        </span>
      </motion.button>
      <figcaption>
        {ar
          ? "عمل خاص. الحقائق عامة؛ الشاشات حقيقية ببيانات مختلقة."
          : "Private client work. Public facts; real product screens with invented data."}
      </figcaption>
    </figure>
  );
}
