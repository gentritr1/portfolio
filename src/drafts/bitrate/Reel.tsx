import { useEffect, useRef, useState } from "react";
import type { Project } from "../../content/projects";
import { projectColour, projectFacts, reelFrames, type Quality } from "./data";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const loading = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
  imageCache.set(src, loading);
  // Keep only a small reel in decoded memory as visitors move through chapters.
  if (imageCache.size > 6) imageCache.delete(imageCache.keys().next().value!);
  void loading.catch(() => {
    if (imageCache.get(src) === loading) imageCache.delete(src);
  });
  return loading;
}

export default function Reel({
  project,
  frame,
  quality,
  reduced,
  onFrameReady,
}: {
  project: Project;
  frame: number;
  quality: Quality;
  reduced: boolean;
  onFrameReady: (caption: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const assets = reelFrames(project);
  const source = assets.length ? assets[frame % assets.length] : undefined;
  const facts = projectFacts(project);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setReady(false);
      return;
    }
    let cancelled = false;
    let animation = 0;
    let image: HTMLImageElement | undefined;
    let cutTime = 0;
    const colour = projectColour(project);
    const caption =
      source?.caption ?? "Project facts · no public image available";
    const sample = document.createElement("canvas");
    const sampleContext = sample.getContext("2d");

    function paint(now = performance.now()) {
      if (cancelled || !canvas || !context) return;
      const width = canvas.getBoundingClientRect().width;
      const nominalHeight =
        quality === "Auto"
          ? width < 720
            ? 480
            : 1080
          : Number.parseInt(quality);
      const scale = quality === "240p" ? 0.55 : quality === "480p" ? 0.75 : 1;
      const height = Math.max(
        135,
        Math.round(
          Math.min(
            nominalHeight,
            (width * Math.min(devicePixelRatio || 1, 2) * 9) / 16,
          ) * scale,
        ),
      );
      canvas.width = Math.round((height * 16) / 9);
      canvas.height = height;
      const w = canvas.width;
      const h = canvas.height;
      context.fillStyle = colour;
      context.fillRect(0, 0, w, h);
      context.imageSmoothingEnabled = quality !== "240p" && quality !== "480p";
      if (image?.naturalWidth) {
        // At the low rungs the source really loses samples, not just contrast.
        const divisor = quality === "240p" ? 8 : quality === "480p" ? 4 : 1;
        sample.width = Math.max(1, Math.round(image.naturalWidth / divisor));
        sample.height = Math.max(1, Math.round(image.naturalHeight / divisor));
        sampleContext?.drawImage(image, 0, 0, sample.width, sample.height);
        const ratio = Math.min(
          (w * 0.79) / image.naturalWidth,
          (h * 0.74) / image.naturalHeight,
        );
        const imageWidth = image.naturalWidth * ratio;
        const imageHeight = image.naturalHeight * ratio;
        context.drawImage(
          sampleContext ? sample : image,
          (w - imageWidth) / 2,
          (h - imageHeight) / 2,
          imageWidth,
          imageHeight,
        );
      } else {
        context.fillStyle = "#11130f";
        context.textAlign = "left";
        context.font = `600 ${h * 0.055}px bit-bricolage, sans-serif`;
        const words = (facts[frame % facts.length] ?? project.line).split(" ");
        let line = "";
        let y = h * 0.35;
        for (const word of words) {
          if (context.measureText(`${line} ${word}`).width > w * 0.72 && line) {
            context.fillText(line, w * 0.14, y);
            line = word;
            y += h * 0.085;
          } else line = line ? `${line} ${word}` : word;
        }
        context.fillText(line, w * 0.14, y);
      }
      const elapsed = now - cutTime;
      if (!reduced && cutTime && elapsed < 120) {
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = 0.16 * (1 - elapsed / 120);
        context.fillStyle = colour;
        context.fillRect(0, 0, w, h);
        context.globalAlpha = 1;
        context.globalCompositeOperation = "source-over";
        animation = requestAnimationFrame(paint);
      }
      setReady(true);
    }

    setReady(false);
    onFrameReady(caption);
    paint();
    if (source)
      void loadImage(source.src)
        .then((loaded) => {
          if (cancelled) return;
          image = loaded;
          cutTime = reduced ? 0 : performance.now();
          paint();
          const next = assets[(frame + 1) % assets.length];
          if (next && next.src !== source.src)
            void loadImage(next.src).catch(() => {});
        })
        .catch(() => {
          if (cancelled) return;
          onFrameReady("Image unavailable · project facts shown");
          paint();
        });
    const observer = new ResizeObserver(() => paint());
    observer.observe(canvas);
    void document.fonts.ready.then(() => {
      if (!cancelled) paint();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(animation);
      observer.disconnect();
    };
    // Frame content comes from the selected project and frame; arrays are recreated deliberately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.slug, frame, quality, reduced, onFrameReady]);

  return (
    <div
      className="bit-reel"
      style={{ backgroundColor: projectColour(project) }}
    >
      {!ready && source && (
        <img
          src={source.src}
          alt=""
          aria-hidden="true"
          className="bit-reel-fallback"
        />
      )}
      <canvas
        ref={canvasRef}
        data-ready={ready}
        data-frame={frame}
        aria-label={`${project.name}: ${source?.caption ?? "project facts"}`}
        role="img"
      />
    </div>
  );
}
