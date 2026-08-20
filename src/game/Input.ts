import type { InputFrame } from "./types";

const P1_KEYS = {
  left: "KeyA",
  right: "KeyD",
  up: "KeyW",
  down: "KeyS",
  punch: "KeyJ",
  kick: "KeyK",
};

const P2_KEYS = {
  left: "ArrowLeft",
  right: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
  punch: ["Numpad1", "Comma"],
  kick: ["Numpad2", "Period"],
};

export class InputManager {
  private pressed = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.pressed.add(e.code);
      if (this.shouldPreventDefault(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      this.pressed.delete(e.code);
    });
    window.addEventListener("blur", () => this.pressed.clear());
  }

  private shouldPreventDefault(code: string): boolean {
    return [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ].includes(code);
  }

  private isDown(codes: string | string[]): boolean {
    if (Array.isArray(codes)) return codes.some((c) => this.pressed.has(c));
    return this.pressed.has(codes);
  }

  getPlayer1(): InputFrame {
    return {
      left: this.isDown(P1_KEYS.left),
      right: this.isDown(P1_KEYS.right),
      up: this.isDown(P1_KEYS.up),
      down: this.isDown(P1_KEYS.down),
      punch: this.isDown(P1_KEYS.punch),
      kick: this.isDown(P1_KEYS.kick),
    };
  }

  getPlayer2(): InputFrame {
    return {
      left: this.isDown(P2_KEYS.left),
      right: this.isDown(P2_KEYS.right),
      up: this.isDown(P2_KEYS.up),
      down: this.isDown(P2_KEYS.down),
      punch: this.isDown(P2_KEYS.punch),
      kick: this.isDown(P2_KEYS.kick),
    };
  }
}
