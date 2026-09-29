import { QROptions, RGBColor } from "../types.js";
import { parseColor } from "../utils/color.js";

const DEFAULT_DARK: RGBColor = { r: 0, g: 0, b: 0 };
const DEFAULT_LIGHT: RGBColor = { r: 255, g: 255, b: 255 };

/**
 * Render QR bit matrix using Sixel Graphics Protocol.
 * Supported by XTerm (with sixel), Foot, mlterm, WezTerm.
 */
export function renderSixel(
  matrix: boolean[][],
  options: QROptions = {}
): string {
  const margin = options.margin !== undefined ? options.margin : (options.small ? 2 : 4);
  const scale = Math.max(1, options.scale || 4); // pixel scale per module

  const matrixSize = matrix.length;
  const totalModules = matrixSize + margin * 2;
  const width = totalModules * scale;
  const height = totalModules * scale;

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

  // Helper to test if a pixel (px, py) is dark
  const isPixelDark = (px: number, py: number): boolean => {
    const mx = Math.floor(px / scale) - margin;
    const my = Math.floor(py / scale) - margin;
    if (mx >= 0 && mx < matrixSize && my >= 0 && my < matrixSize) {
      return matrix[my][mx];
    }
    return false;
  };

  // Convert RGB 0..255 to percentage 0..100
  const toPct = (val: number) => Math.round((val / 255) * 100);

  // Sixel Header: Introducer + Aspect Ratio (1:1) + Grid dimensions
  let sixel = `\x1bPq"1;1;${width};${height}`;

  // Color registers: #0 = Light/Background, #1 = Dark/Foreground
  sixel += `#0;2;${toPct(lightColor.r)};${toPct(lightColor.g)};${toPct(lightColor.b)}`;
  sixel += `#1;2;${toPct(darkColor.r)};${toPct(darkColor.g)};${toPct(darkColor.b)}`;

  // Encode 6 vertical pixels per sixel row
  for (let y = 0; y < height; y += 6) {
    // Process color 0 (background) and color 1 (foreground)
    for (const colorIndex of [0, 1]) {
      let rowStr = `#${colorIndex}`;
      let lastChar = "";
      let repeatCount = 0;

      const flushRepeat = () => {
        if (repeatCount === 0) return;
        if (repeatCount === 1) {
          rowStr += lastChar;
        } else if (repeatCount <= 3) {
          rowStr += lastChar.repeat(repeatCount);
        } else {
          rowStr += `!${repeatCount}${lastChar}`;
        }
        repeatCount = 0;
      };

      for (let x = 0; x < width; x++) {
        let sixelByte = 0;
        for (let bit = 0; bit < 6; bit++) {
          const py = y + bit;
          if (py < height) {
            const isDark = isPixelDark(x, py);
            const matchesColor = colorIndex === 1 ? isDark : !isDark;
            if (matchesColor) {
              sixelByte |= 1 << bit;
            }
          }
        }
        const char = String.fromCharCode(63 + sixelByte);
        if (char === lastChar) {
          repeatCount++;
        } else {
          flushRepeat();
          lastChar = char;
          repeatCount = 1;
        }
      }
      flushRepeat();

      // Carriage return if we have another color in this sixel row
      if (colorIndex === 0) {
        sixel += `${rowStr}$`;
      } else {
        // Line feed to next sixel row
        sixel += `${rowStr}-`;
      }
    }
  }

  // Sixel terminator
  sixel += `\x1b\\`;
  return sixel + "\n";
}
