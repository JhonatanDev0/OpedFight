import { GROUND_Y } from "./constants";
import type { Fighter } from "./Fighter";

export function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter) {
  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(f.x + f.width / 2, GROUND_Y + 6, f.width * 0.55, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  let bodyColor = f.color;
  if (f.state === "hitstun" || f.hitFlash > 0) bodyColor = "#ffffff";
  else if (f.state === "block") bodyColor = shade(f.color, -30);
  else if (f.state === "ko") bodyColor = "#555555";

  ctx.fillStyle = bodyColor;
  ctx.fillRect(f.x, f.y, f.width, f.height);

  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(f.x, f.y, f.width, f.height);

  // Facing indicator (a little "nose" triangle)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const eyeY = f.y + f.height * 0.18;
  const noseX = f.facing === 1 ? f.x + f.width : f.x;
  ctx.beginPath();
  ctx.moveTo(noseX, eyeY - 6);
  ctx.lineTo(noseX + f.facing * 14, eyeY);
  ctx.lineTo(noseX, eyeY + 6);
  ctx.closePath();
  ctx.fill();

  // Attack limb swing
  const hitbox = f.getHitbox();
  if (hitbox) {
    ctx.fillStyle = f.attackDef?.name === "kick" ? "#ff8c42" : "#ffe066";
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
  }

  ctx.restore();
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `rgb(${r}, ${g}, ${b})`;
}
