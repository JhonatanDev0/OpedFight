import { drawArena } from "./Arena";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  FIXED_DT,
  PUSH_SEPARATION,
  ROUND_TIME,
} from "./constants";
import { Fighter } from "./Fighter";
import { drawHud } from "./Hud";
import { InputManager } from "./Input";
import { drawFighter } from "./Renderer";
import type { Rect } from "./types";

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

type Phase = "fight" | "roundOver";

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input = new InputManager();
  private p1: Fighter;
  private p2: Fighter;
  private timeLeft = ROUND_TIME;
  private phase: Phase = "fight";
  private message: string | null = null;
  private roundOverTimer = 0;
  private accumulator = 0;
  private lastTime = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;

    this.p1 = new Fighter(200, 1, "#3b82f6", "P1");
    this.p2 = new Fighter(ARENA_WIDTH - 200 - 60, -1, "#ef4444", "P2");
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const frameTime = Math.min(0.25, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.accumulator += frameTime;

    while (this.accumulator >= FIXED_DT) {
      this.step(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    this.render();
    requestAnimationFrame(this.loop);
  };

  private step(dt: number) {
    if (this.phase === "roundOver") {
      this.roundOverTimer -= dt;
      if (this.roundOverTimer <= 0) this.startRound();
      return;
    }

    const in1 = this.input.getPlayer1();
    const in2 = this.input.getPlayer2();

    this.p1.update(dt, in1, this.p2.x);
    this.p2.update(dt, in2, this.p1.x);

    this.resolveCombat();
    this.resolveSeparation();

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endRound(this.p1.health === this.p2.health ? "EMPATE!" : this.p1.health > this.p2.health ? "P1 VENCE!" : "P2 VENCE!");
      return;
    }

    if (this.p1.isKO || this.p2.isKO) {
      this.endRound(this.p1.isKO && this.p2.isKO ? "EMPATE!" : this.p1.isKO ? "P2 VENCE!" : "P1 VENCE!");
    }
  }

  private resolveCombat() {
    this.applyAttack(this.p1, this.p2);
    this.applyAttack(this.p2, this.p1);
  }

  private applyAttack(attacker: Fighter, defender: Fighter) {
    if (attacker.hasHit) return;
    const hitbox = attacker.getHitbox();
    if (!hitbox) return;
    if (defender.isKO) return;
    if (!intersects(hitbox, defender.getHurtbox())) return;

    attacker.hasHit = true;
    const def = attacker.attackDef!;
    const blocked = defender.blocking && !defender.isKO;
    defender.takeHit(def.damage, def.knockback, def.hitstun, attacker.facing, blocked);
  }

  private resolveSeparation() {
    const a = this.p1;
    const b = this.p2;
    const left = a.x <= b.x ? a : b;
    const right = a.x <= b.x ? b : a;
    const gap = right.x - (left.x + left.width);
    const overlap = PUSH_SEPARATION - gap;
    if (overlap > 0) {
      const push = overlap / 2;
      left.x -= push;
      right.x += push;
    }
  }

  private endRound(message: string) {
    this.phase = "roundOver";
    this.message = message;
    this.roundOverTimer = 2.5;
  }

  private startRound() {
    this.phase = "fight";
    this.message = null;
    this.timeLeft = ROUND_TIME;
    this.p1.reset(200, 1);
    this.p2.reset(ARENA_WIDTH - 200 - 60, -1);
  }

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    drawArena(ctx);
    drawFighter(ctx, this.p1);
    drawFighter(ctx, this.p2);
    drawHud(ctx, this.p1, this.p2, this.timeLeft, this.message);
  }
}
