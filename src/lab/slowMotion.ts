/** Development review only: slows both browser animations and rAF spring clocks. */
export function installSlowMotion() {
  const nativeNow = performance.now.bind(performance);
  const nativeFrame = window.requestAnimationFrame.bind(window);
  const started = nativeNow();
  const scaled = (now: number) => started + (now - started) * 0.1;
  Object.defineProperty(performance, "now", {
    configurable: true,
    value: () => scaled(nativeNow()),
  });
  window.requestAnimationFrame = (callback) =>
    nativeFrame((time) => callback(scaled(time)));
  // Gesture suppression compares event timestamps with performance.now(). Keep
  // both on the same review clock, so a drag does not become an accidental click.
  const eventTime = Object.getOwnPropertyDescriptor(
    Event.prototype,
    "timeStamp",
  );
  if (eventTime?.get) {
    Object.defineProperty(Event.prototype, "timeStamp", {
      configurable: true,
      get() {
        return scaled(eventTime.get!.call(this));
      },
    });
  }
  // Motion sets WAAPI startTime using performance.now(). Translate that value
  // back to the browser timeline so the native and JavaScript clocks agree.
  const nativeAnimate = Element.prototype.animate;
  const startTime = Object.getOwnPropertyDescriptor(
    Animation.prototype,
    "startTime",
  )!;
  Element.prototype.animate = function (keyframes, options) {
    const animation = nativeAnimate.call(this, keyframes, options);
    Object.defineProperty(animation, "startTime", {
      configurable: true,
      get: () => {
        const value = startTime.get!.call(animation);
        return typeof value === "number" ? scaled(value) : value;
      },
      set: (value) =>
        startTime.set!.call(
          animation,
          typeof value === "number" ? started + (value - started) / 0.1 : value,
        ),
    });
    animation.playbackRate = 0.1;
    return animation;
  };
  const nativeTimeout = window.setTimeout.bind(window);
  const nativeInterval = window.setInterval.bind(window);
  window.setTimeout = ((handler: TimerHandler, delay = 0, ...args: unknown[]) =>
    nativeTimeout(handler, delay * 10, ...args)) as typeof window.setTimeout;
  window.setInterval = ((
    handler: TimerHandler,
    delay = 0,
    ...args: unknown[]
  ) =>
    nativeInterval(handler, delay * 10, ...args)) as typeof window.setInterval;
  document.documentElement.dataset.reviewSpeed = "0.1";
  // CSS transitions and WAAPI animations have browser-owned clocks, independent of rAF.
  const seen = new WeakSet<Animation>();
  const track = () => {
    for (const animation of document.getAnimations()) {
      if (seen.has(animation)) continue;
      animation.updatePlaybackRate(0.1);
      seen.add(animation);
    }
    nativeFrame(track);
  };
  nativeFrame(track);
}
