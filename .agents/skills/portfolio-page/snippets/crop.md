# Cropping a screenshot to the part that proves the line

`object-fit` cannot crop to an arbitrary region. Use a window with `overflow: hidden` and position the image inside it at a known scale.

```html
<figure class="crop" style="--w: 2880; --h: 1800; --x: 0.12; --y: 0.18; --scale: 0.5">
  <div class="crop-window" data-work="Care platform">
    <img src="/showcase/care-dashboard/appointments-week.webp" width="2880" height="1800"
         alt="Care team calendar for one week, with visits and calls" fetchpriority="high">
  </div>
  <figcaption>Care team calendar. Real product screens, invented data.</figcaption>
</figure>
```

```css
.crop-window { position: relative; overflow: hidden; aspect-ratio: 16 / 10; border-radius: 6px; }
.crop-window img {
  position: absolute; max-width: none;
  width: calc(var(--w) * var(--scale) * 1px);           /* 0.5 = shown at 1:1 CSS px on a 2× capture */
  height: auto;
  left: calc(var(--w) * var(--scale) * var(--x) * -1px); /* --x, --y: the crop's top-left as a share of the image */
  top: calc(var(--h) * var(--scale) * var(--y) * -1px);
}
```

Rules:
- `--scale` 0.5 shows a 2× capture at actual size: sharp and readable. Do not go above 0.5 for 2× files.
- Density: with a 2× file, the window can be at most `natural width × 0.5` wide before it upscales. On a phone, keep text in the crop at ≥ 11 CSS px: if the capture's body text is 14px at 1×, `--scale` must stay ≥ 0.39 (14 × 2 × 0.39 ≈ 11).
- Crop on whole UI rows; never cut a line of text or a button in half.
- The window, not the image, gets `data-work`, so the checker counts the visible area.
