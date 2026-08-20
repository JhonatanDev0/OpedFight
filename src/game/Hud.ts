import { ARENA_WIDTH, MAX_HEALTH } from "./constants";
import type { Fighter } from "./Fighter";

const BAR_W = 360;
const BAR_H = 22;
const BAR_Y = 24;

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, health: number, flipped: boolean) {
  const pct = Math.max(0, health / MAX_HEALTH);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x, BAR_Y, BAR_W, BAR_H);

  ctx.fillStyle = pct > 0.5 ? "#4ade80" : pct > 0.2 ? "#facc15" : "#ef4444";
  const filledW = BAR_W * pct;
  if (flipped) {
    ctx.fillRect(x + BAR_W - filledW, BAR_Y, filledW, BAR_H);
  } else {
    ctx.fillRect(x, BAR_Y, filledW, BAR_H);
  }

  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, BAR_Y, BAR_W, BAR_H);
}

export function drawHud(
  ctx: CanvasRenderingContext2D,
  p1: Fighter,
  p2: Fighter,
  timeLeft: number,
  message: string | null
) {
  drawHealthBar(ctx, 20, p1.health, false);
  drawHealthBar(ctx, ARENA_WIDTH - 20 - BAR_W, p2.health, true);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText(p1.name, 20, BAR_Y - 6);
  ctx.textAlign = "right";
  ctx.fillText(p2.name, ARENA_WIDTH - 20, BAR_Y - 6);

  ctx.fillStyle = "#111";
  ctx.fillRect(ARENA_WIDTH / 2 - 30, BAR_Y - 4, 60, 30);
  ctx.strokeStyle = "#eee";
  ctx.strokeRect(ARENA_WIDTH / 2 - 30, BAR_Y - 4, 60, 30);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(Math.ceil(timeLeft)), ARENA_WIDTH / 2, BAR_Y + 19);

  if (message) {
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(message, ARENA_WIDTH / 2 + 3, 240 + 3);
    ctx.fillStyle = "#ffd23f";
    ctx.fillText(message, ARENA_WIDTH / 2, 240);
  }

  ctx.textAlign = "left";
}
