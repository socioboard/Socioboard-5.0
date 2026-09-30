// Gesture maths from Apple's "Designing Fluid Interfaces" (WWDC 2018; the apple-design skill):
// where a flick is heading, how an edge resists, and how fast the finger was moving when it let go.

/**
 * How far a flick carries: the distance the motion would travel while decelerating from
 * `velocity` (px/s), as scrolling does. 0.998 feels like normal scrolling; 0.99 is snappier.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Past an edge, the element follows less and less the further it's pulled: `overshoot` px of
 * pointer travel become this many px of movement (for a surface `dimension` px long).
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** The pointer's recent positions, for its velocity at release (px/s). */
export function createVelocityTracker(windowMs = 100) {
  let samples: { value: number; time: number }[] = [];
  return {
    add(value: number, time: number) {
      samples.push({ value, time });
      samples = samples.filter((s) => time - s.time <= windowMs);
    },
    velocity(): number {
      const first = samples[0];
      const last = samples[samples.length - 1];
      if (!first || !last || last.time === first.time) return 0;
      return ((last.value - first.value) / (last.time - first.time)) * 1000;
    },
    reset() {
      samples = [];
    },
  };
}
