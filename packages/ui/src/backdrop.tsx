import { useId } from 'react';

/**
 * The ambient backdrop behind every glass pane: a neutral base, three soft Aurora glows, and a fine
 * grain so the glass reads as a material. The glows stay still: moving them made every glass pane
 * re-blur its backdrop on every frame. Render
 * once, at the root; it sits behind everything and ignores the pointer.
 */
export function Backdrop() {
  const grainId = useId();
  return (
    <div className="sb-backdrop" aria-hidden="true">
      <div className="sb-backdrop-glows">
        {/* Sized to the viewport, so a phone gets the same balance of color as a desktop. */}
        <div
          className="sb-glow"
          style={{
            width: '43vmax',
            height: '43vmax',
            left: '-8vw',
            top: '-18vh',
            background: 'var(--sb-glow-1)',
          }}
        />
        <div
          className="sb-glow"
          style={{
            width: '53vmax',
            height: '53vmax',
            right: '-14vw',
            top: '13vh',
            background: 'var(--sb-glow-2)',
          }}
        />
        <div
          className="sb-glow"
          style={{
            width: '36vmax',
            height: '36vmax',
            left: '38%',
            bottom: '-29vh',
            background: 'var(--sb-glow-3)',
          }}
        />
      </div>
      <svg className="sb-grain" xmlns="http://www.w3.org/2000/svg">
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </div>
  );
}
