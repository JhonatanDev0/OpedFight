import { ARENA_HEIGHT, ARENA_WIDTH, GROUND_Y } from "./constants";

export function drawArena(ctx: CanvasRenderingContext2D) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, "#2b1f4d");
  sky.addColorStop(1, "#5a3d78");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ARENA_WIDTH, GROUND_Y);

  // Distant silhouette skyline
  ctx.fillStyle = "rgba(15, 10, 30, 0.55)";
  for (let i = 0; i < 8; i++) {
    const w = 60 + ((i * 37) % 50);
    const h = 60 + ((i * 53) % 120);
    const x = i * 130 - 20;
    ctx.fillRect(x, GROUND_Y - h - 20, w, h);
  }

  // Floor
  ctx.fillStyle = "#3a2a4a";
  ctx.fillRect(0, GROUND_Y, ARENA_WIDTH, ARENA_HEIGHT - GROUND_Y);

  // Floor stage line + tiles
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < ARENA_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x - 20, ARENA_HEIGHT);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 200, 80, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(ARENA_WIDTH, GROUND_Y);
  ctx.stroke();
}
