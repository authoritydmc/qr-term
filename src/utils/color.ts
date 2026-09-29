import { RGBColor } from "../types.js";

export function parseColor(color: string | RGBColor | undefined, fallback: RGBColor): RGBColor {
  if (!color) return fallback;
  if (typeof color === "object" && "r" in color && "g" in color && "b" in color) {
    return color;
  }

  if (typeof color === "string") {
    let hex = color.trim().replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      if (!isNaN(num)) {
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255,
        };
      }
    }
  }

  return fallback;
}

export function fgRgb(rgb: RGBColor): string {
  return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
}

export function bgRgb(rgb: RGBColor): string {
  return `\x1b[48;2;${rgb.r};${rgb.g};${rgb.b}m`;
}

export const ANSI_RESET = "\x1b[0m";
