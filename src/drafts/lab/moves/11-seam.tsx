import type { LabMoveProps } from "../types";
import "./11-seam.css";

function Version({ current }: { current: boolean }) {
  return (
    <div
      className={"lm11-version " + (current ? "lm11-new" : "lm11-old")}
      aria-hidden={!current}
    >
      <span>{current ? "React rewrite" : "Nuxt 2 application"}</span>
      <h3>Care, carried forward.</h3>
      <dl>
        <div>
          <dt>Care plans</dt>
          <dd>{current ? "Same journey" : "Existing journey"}</dd>
        </div>
        <div>
          <dt>Calls & chat</dt>
          <dd>{current ? "Same journey" : "Existing journey"}</dd>
        </div>
        <div>
          <dt>Billing claims</dt>
          <dd>{current ? "Same journey" : "Existing journey"}</dd>
        </div>
      </dl>
      <p>
        {current
          ? "31 architecture decisions. Route-by-route parity tests."
          : "An established application, moved one route at a time."}
      </p>
    </div>
  );
}

export default function SeamMove({ active, reduced }: LabMoveProps) {
  return (
    <div className="lm11" data-active={active} data-reduced={reduced}>
      <p className="lm11-instruction">
        Scroll inside the panel. The seam follows your position.
      </p>
      <div
        className="lm11-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable care-platform migration illustration. Use arrow keys or Page Down to move the seam."
      >
        <div className="lm11-story">
          <div className="lm11-sticky">
            <Version current={false} />
            <Version current />
            <div className="lm11-seam" aria-hidden="true">
              <span />
            </div>
          </div>
          <p className="lm11-end">End of the illustration / React</p>
        </div>
      </div>
      <p className="lm11-caption">
        Local illustration using real care-platform facts.{" "}
        <span className="lm11-fallback">
          Scroll timelines unavailable: final state shown.
        </span>
        {reduced && " Reduced motion: final state shown."}
      </p>
    </div>
  );
}
