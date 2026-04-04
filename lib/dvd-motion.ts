export type MovingRectState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export function moveBouncingRect(
  current: MovingRectState,
  boundsWidth: number,
  boundsHeight: number,
  rectWidth: number,
  rectHeight: number,
  dt: number,
): MovingRectState {
  const maxX = Math.max(boundsWidth - rectWidth, 0);
  const maxY = Math.max(boundsHeight - rectHeight, 0);
  let nextX = current.x + current.vx * dt;
  let nextY = current.y + current.vy * dt;
  let nextVx = current.vx;
  let nextVy = current.vy;

  if (nextX <= 0 || nextX >= maxX) {
    nextX = clamp(nextX, 0, maxX);
    nextVx *= -1;
  }

  if (nextY <= 0 || nextY >= maxY) {
    nextY = clamp(nextY, 0, maxY);
    nextVy *= -1;
  }

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
