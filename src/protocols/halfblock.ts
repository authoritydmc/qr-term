import { QROptions, RGBColor } from "../types.js";
import { parseColor, fgRgb, bgRgb, ANSI_RESET } from "../utils/color.js";

const DEFAULT_DARK: RGBColor = { r: 0, g: 0, b: 0 };
const DEFAULT_LIGHT: RGBColor = { r: 255, g: 255, b: 255 };

function colorsEqual(a: RGBColor, b: RGBColor): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

/**
 * Render QR bit matrix using Unicode Half-Block characters (▀).
 * Each character cell encodes 2 vertical modules for a sharp 1:1 aspect ratio.
 * Consecutive identical ANSI colors are optimized to reduce payload size.
 */
export function renderHalfBlock(
  matrix: boolean[][],
  options: QROptions = {}
): string {
  const margin = options.margin !== undefined ? options.margin : (options.small ? 1 : 2);
  const size = matrix.length;
  const fullSize = size + margin * 2;

  let darkColor = parseColor(options.foreground, DEFAULT_DARK);
  let lightColor = parseColor(
    options.background === "transparent" ? undefined : options.background,
    DEFAULT_LIGHT
  );

  if (options.invert) {
    const tmp = darkColor;
    darkColor = lightColor;
    lightColor = tmp;
  }

  // Build full matrix with margin (margin is light)
  const grid: boolean[][] = [];
  for (let y = 0; y < fullSize; y++) {
    grid[y] = [];
    for (let x = 0; x < fullSize; x++) {
      const mx = x - margin;
      const my = y - margin;
      if (mx >= 0 && mx < size && my >= 0 && my < size) {
        grid[y][x] = matrix[my][mx];
      } else {
        grid[y][x] = false; // Margin is light/white
      }
    }
  }

  const lines: string[] = [];

  // Iterate 2 rows at a time
  for (let y = 0; y < fullSize; y += 2) {
    let line = "";
    let lastFg: RGBColor | null = null;
    let lastBg: RGBColor | null = null;

    for (let x = 0; x < fullSize; x++) {
      const topDark = grid[y][x];
      const botDark = y + 1 < fullSize ? grid[y + 1][x] : false;

      const topColor = topDark ? darkColor : lightColor;
      const botColor = botDark ? darkColor : lightColor;

      // Optimize ANSI escape codes by only emitting when color changes
      if (!lastFg || !colorsEqual(topColor, lastFg)) {
        line += fgRgb(topColor);
        lastFg = topColor;
      }
      if (!lastBg || !colorsEqual(botColor, lastBg)) {
        line += bgRgb(botColor);
        lastBg = botColor;
      }

      line += "▀";
    }
    line += ANSI_RESET;
    lines.push(line);
  }

  return lines.join("\n");
}
