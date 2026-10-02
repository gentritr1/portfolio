import type { ShowcaseItem } from './Showcase'

/** Store frames side by side on a monitor stage. The row scrolls when the stage is narrower than the frames. */
export function MonitorGallery({ items }: { items: ShowcaseItem[] }) {
  return (
    <ul className="absolute inset-0 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto bg-panel-2 px-[6%] sm:gap-4">
      {items.map((item) => (
        <li key={item.src} className="h-[78%] shrink-0 snap-center lg:h-[74%]">
          <img
            src={item.src}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="block h-full w-auto rounded-md border border-hairline"
          />
        </li>
      ))}
    </ul>
  )
}
