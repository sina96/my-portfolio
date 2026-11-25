import type { CSSProperties } from "react";
import { NETWORK } from "../data/system";
import { SystemGlyph } from "./SystemGlyph";

/**
 * Both request paths as aligned tile rows (two columns on mobile). The tiles are ordered lists, so
 * screen readers get the steps directly; arrows and the stepping highlight are decorative CSS.
 */
export function NetworkDiagram() {
  return (
    <div className="system-flows">
      {Object.values(NETWORK).map(({ label, steps }) => (
        <section key={label} className="system-flow" aria-labelledby={`system-flow-${label}`}>
          <h2 id={`system-flow-${label}`}>{label}</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={`${step.label}-${index}`} className="system-node" data-provider={step.provider}
                style={{ "--step": index } as CSSProperties}>
                <SystemGlyph icon={step.icon} size={24} />
                <span className="system-node-label">{step.label}</span>
                <span className="system-node-by">{step.by}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
