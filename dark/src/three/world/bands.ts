/**
 * How a beat arrives and leaves.
 *
 * Both halves of the world use these: the HTML overlay fades its copy with
 * them, and the film screens in the canvas fade with them too. Keeping the
 * one function means a panel and the footage behind it can never drift into
 * using two different curves.
 */

/** Smooth 0-to-1 ramp, so a beat arrives and leaves without a corner */
export function ramp(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** How present a beat is at progress `p`: up over its first third, down over its last */
export function bandOpacity(p: number, [start, end]: [number, number]): number {
  const fade = (end - start) * 0.3;
  return ramp(start, start + fade, p) * (1 - ramp(end - fade, end, p));
}
