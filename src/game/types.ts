export type FighterState =
  | "idle"
  | "walk"
  | "jump"
  | "crouch"
  | "punch"
  | "kick"
  | "hitstun"
  | "block"
  | "ko";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AttackDef {
  name: "punch" | "kick";
  startup: number; // seconds before hitbox becomes active
  active: number; // seconds hitbox stays active
  recovery: number; // seconds after active before returning to idle
  damage: number;
  knockback: number; // px/s applied to opponent
  hitstun: number; // seconds opponent is frozen
  range: number; // horizontal reach from fighter edge
  height: number; // hitbox height
  offsetY: number; // vertical offset from fighter top
}

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
}
