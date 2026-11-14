export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Projected2D {
  x: number;
  y: number;
  depth: number;
}

export function project3D(
  pt: Point3D,
  yawDeg: number,
  pitchDeg: number,
  cx: number,
  cy: number,
): Projected2D {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  const rx = pt.x * cosY - pt.z * sinY;
  const rz = pt.x * sinY + pt.z * cosY;

  return {
    x: cx + rx,
    y: cy + pt.y * cosP + rz * sinP,
    depth: rz * cosP - pt.y * sinP,
  };
}

export function toSvgPoly(pts: Projected2D[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export function projectRing3D(
  radiusX: number,
  radiusZ: number,
  y: number,
  steps: number,
  yawDeg: number,
  pitchDeg: number,
  cx: number,
  cy: number,
): Projected2D[] {
  const out: Projected2D[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    out.push(
      project3D(
        { x: Math.cos(a) * radiusX, y, z: Math.sin(a) * radiusZ },
        yawDeg,
        pitchDeg,
        cx,
        cy,
      ),
    );
  }
  return out;
}
