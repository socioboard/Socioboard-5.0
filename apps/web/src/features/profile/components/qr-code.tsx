import { encode } from 'uqr';

/**
 * A QR code drawn as SVG squares (no HTML injection). Always dark on white, whatever the theme:
 * authenticator apps scan that most reliably.
 */
export function QrCode({
  value,
  label,
  size = 176,
}: {
  value: string;
  label: string;
  size?: number;
}) {
  // The 4-module quiet zone the QR spec asks for; scanners are fussy without it.
  const { data } = encode(value, { ecc: 'M', border: 4 });
  const modules = data.length;
  const path = data
    .flatMap((row, y) => row.map((on, x) => (on ? `M${String(x)} ${String(y)}h1v1h-1z` : '')))
    .join('');
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${String(modules)} ${String(modules)}`}
      shapeRendering="crispEdges"
      className="rounded-control bg-white"
    >
      <path d={path} fill="#11141a" />
    </svg>
  );
}
