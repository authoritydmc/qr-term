import { QROptions, RGBColor } from "../types.js";
import { parseColor, bgRgb, ANSI_RESET } from "../utils/color.js";

const DEFAULT_DARK: RGBColor = { r: 0, g: 0, b: 0 };
const DEFAULT_LIGHT: RGBColor = { r: 255, g: 255, b: 255 };

/**
 * Render QR bit matrix using Full-Block pairs (██ or spaces with background color).
 */
export function renderFullBlock(
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

  const lines: string[] = [];

  for (let y = 0; y < fullSize; y++) {
    let line = "";
    for (let x = 0; x < fullSize; x++) {
      const mx = x - margin;
      const my = y - margin;
      const isDark = mx >= 0 && mx < size && my >= 0 && my < size ? matrix[my][mx] : false;
      const color = isDark ? darkColor : lightColor;
      line += `${bgRgb(color)}  `;
    }
    line += ANSI_RESET;
    lines.push(line);
  }

  return lines.join("\n");
}
