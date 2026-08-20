import {
  ARENA_MARGIN,
  ARENA_WIDTH,
  CROUCH_HEIGHT,
  FIGHTER_HEIGHT,
  FIGHTER_WIDTH,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  MAX_HEALTH,
  WALK_SPEED,
} from "./constants";
import type { AttackDef, FighterState, InputFrame, Rect } from "./types";

const PUNCH: AttackDef = {
  name: "punch",
  startup: 0.08,
  active: 0.08,
  recovery: 0.16,
  damage: 6,
  knockback: 260,
  hitstun: 0.35,
  range: 46,
  height: 30,
  offsetY: 30,
};

const KICK: AttackDef = {
  name: "kick",
  startup: 0.14,
  active: 0.1,
  recovery: 0.26,
  damage: 11,
  knockback: 420,
  hitstun: 0.5,
  range: 58,
  height: 36,
  offsetY: 70,
};

export class Fighter {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  facing: 1 | -1;
  state: FighterState = "idle";
  health = MAX_HEALTH;
  isGrounded = true;
  isCrouching = false;
  blocking = false;

  attackDef: AttackDef | null = null;
  attackElapsed = 0;
  hasHit = false;

  hitstunTimer = 0;
  hitFlash = 0;

  readonly color: string;
  readonly name: string;

  constructor(x: number, facing: 1 | -1, color: string, name: string) {
    this.x = x;
    this.facing = facing;
    this.color = color;
    this.name = name;
    this.y = GROUND_Y - FIGHTER_HEIGHT;
  }

  get width(): number {
    return FIGHTER_WIDTH;
  }

  get height(): number {
    return this.isCrouching ? CROUCH_HEIGHT : FIGHTER_HEIGHT;
  }

  get isKO(): boolean {
    return this.health <= 0;
  }

  getHurtbox(): Rect {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  getHitbox(): Rect | null {
    if (!this.attackDef) return null;
    const t = this.attackElapsed;
    const { startup, active, range, height, offsetY } = this.attackDef;
    if (t < startup || t >= startup + active) return null;
    const box: Rect = {
      x: this.facing === 1 ? this.x + this.width : this.x - range,
      y: this.y + offsetY,
      w: range,
      h: height,
    };
    return box;
  }

  startAttack(def: AttackDef) {
    this.attackDef = def;
    this.attackElapsed = 0;
    this.hasHit = false;
    this.state = def.name;
    this.isCrouching = false;
  }

  takeHit(damage: number, knockback: number, hitstun: number, attackerFacing: 1 | -1, blocked: boolean) {
    this.attackDef = null;
    this.attackElapsed = 0;
    if (blocked) {
      this.health = Math.max(0, this.health - damage * 0.15);
      this.vx = attackerFacing * knockback * 0.3;
      this.hitstunTimer = hitstun * 0.4;
    } else {
      this.health = Math.max(0, this.health - damage);
      this.vx = attackerFacing * knockback;
      this.hitstunTimer = hitstun;
    }
    this.hitFlash = 0.12;
    this.state = this.health <= 0 ? "ko" : "hitstun";
  }

  update(dt: number, input: InputFrame, opponentX: number) {
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);

    if (this.isKO) {
      this.state = "ko";
      this.vx = 0;
      this.applyPhysics(dt);
      return;
    }

    if (this.hitstunTimer > 0) {
      this.hitstunTimer = Math.max(0, this.hitstunTimer - dt);
      this.vx *= 1 - Math.min(1, dt * 6);
      this.blocking = false;
      this.applyPhysics(dt);
      if (this.hitstunTimer === 0) this.state = "idle";
      return;
    }

    // Auto-face opponent when not committed to an attack.
    if (!this.attackDef) {
      this.facing = opponentX >= this.x ? 1 : -1;
    }

    if (this.attackDef) {
      this.attackElapsed += dt;
      this.vx = 0;
      const total = this.attackDef.startup + this.attackDef.active + this.attackDef.recovery;
      if (this.attackElapsed >= total) {
        this.attackDef = null;
        this.attackElapsed = 0;
        this.state = "idle";
      }
      this.applyPhysics(dt);
      return;
    }

    const holdingBack =
      this.isGrounded && ((this.facing === 1 && input.left) || (this.facing === -1 && input.right));
    const holdingForward =
      this.isGrounded && ((this.facing === 1 && input.right) || (this.facing === -1 && input.left));

    if (this.isGrounded && input.punch) {
      this.startAttack(PUNCH);
      this.applyPhysics(dt);
      return;
    }
    if (this.isGrounded && input.kick) {
      this.startAttack(KICK);
      this.applyPhysics(dt);
      return;
    }

    if (this.isGrounded && input.up) {
      this.vy = JUMP_VELOCITY;
      this.isGrounded = false;
      this.isCrouching = false;
      this.blocking = false;
      this.state = "jump";
    } else if (this.isGrounded && input.down) {
      this.isCrouching = true;
      this.vx = 0;
      this.blocking = holdingBack;
      this.state = this.blocking ? "block" : "crouch";
    } else if (this.isGrounded && holdingBack) {
      this.isCrouching = false;
      this.blocking = true;
      this.vx = this.facing * -WALK_SPEED * 0.55;
      this.state = "block";
    } else if (this.isGrounded && holdingForward) {
      this.isCrouching = false;
      this.blocking = false;
      this.vx = this.facing * WALK_SPEED;
      this.state = "walk";
    } else if (!this.isGrounded) {
      this.blocking = false;
      this.state = "jump";
    } else {
      this.isCrouching = false;
      this.blocking = false;
      this.vx = 0;
      this.state = "idle";
    }

    this.applyPhysics(dt);
  }

  private applyPhysics(dt: number) {
    if (!this.isGrounded) {
      this.vy += GRAVITY * dt;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const groundLevel = GROUND_Y - this.height;
    if (this.isGrounded) {
      // Stay snapped to the ground even when height changes (e.g. crouch toggle).
      this.y = groundLevel;
      this.vy = 0;
    } else if (this.y >= groundLevel) {
      this.y = groundLevel;
      this.vy = 0;
      this.isGrounded = true;
      if (this.state === "jump") this.state = "idle";
    }

    const minX = ARENA_MARGIN;
    const maxX = ARENA_WIDTH - ARENA_MARGIN - this.width;
    this.x = Math.max(minX, Math.min(maxX, this.x));
  }

  reset(x: number, facing: 1 | -1) {
    this.x = x;
    this.y = GROUND_Y - FIGHTER_HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.state = "idle";
    this.health = MAX_HEALTH;
    this.isGrounded = true;
    this.isCrouching = false;
    this.blocking = false;
    this.attackDef = null;
    this.attackElapsed = 0;
    this.hasHit = false;
    this.hitstunTimer = 0;
    this.hitFlash = 0;
  }
}
