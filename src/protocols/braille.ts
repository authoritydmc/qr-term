import { QROptions } from "../types.js";
import { parseColor, fgRgb, ANSI_RESET } from "../utils/color.js";

const BRAILLE_OFFSET = 0x2800;
const BRAILLE_MAP = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

/**
 * Render QR bit matrix using 2x4 Braille characters for ultra-compact output.
 */
export function renderBraille(
  matrix: boolean[][],
  options: QROptions = {}
): string {
  const margin = options.margin !== undefined ? options.margin : 1;
  const size = matrix.length;
  const fullSize = size + margin * 2;

  const darkColor = parseColor(options.foreground, { r: 255, g: 255, b: 255 });
  const invert = Boolean(options.invert);

  // Build full matrix
  const grid: boolean[][] = [];
  for (let y = 0; y < fullSize; y++) {
    grid[y] = [];
    for (let x = 0; x < fullSize; x++) {
      const mx = x - margin;
      const my = y - margin;
      if (mx >= 0 && mx < size && my >= 0 && my < size) {
        grid[y][x] = matrix[my][mx];
      } else {
        grid[y][x] = false;
      }
    }
  }

  const lines: string[] = [];

  for (let y = 0; y < fullSize; y += 4) {
    let line = "";
    for (let x = 0; x < fullSize; x += 2) {
      let byte = 0;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const gy = y + dy;
          const gx = x + dx;
          const isDark = gy < fullSize && gx < fullSize ? grid[gy][gx] : false;
          const active = invert ? !isDark : isDark;
          if (active) {
            byte |= BRAILLE_MAP[dy][dx];
          }
        }
      }
      line += String.fromCharCode(BRAILLE_OFFSET + byte);
    }
    lines.push(`${fgRgb(darkColor)}${line}${ANSI_RESET}`);
  }

  return lines.join("\n");
}
