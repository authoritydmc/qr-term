import QRCode from "qrcode";
import { QROptions, TerminalProtocol, ErrorCorrectionLevel } from "./types.js";
import { detectTerminalCapabilities } from "./detector.js";
import { renderHalfBlock } from "./protocols/halfblock.js";
import { renderFullBlock } from "./protocols/fullblock.js";
import { renderBraille } from "./protocols/braille.js";
import { renderITerm2 } from "./protocols/iterm2.js";
import { renderKitty } from "./protocols/kitty.js";
import { renderSixel } from "./protocols/sixel.js";

/**
 * Generate 2D boolean matrix of QR modules (true = dark, false = light).
 */
export function createQRMatrix(
  text: string,
  ecc: ErrorCorrectionLevel = "M"
): boolean[][] {
  const qr = QRCode.create(text, { errorCorrectionLevel: ecc });
  const size = qr.modules.size;
  const matrix: boolean[][] = [];

  for (let row = 0; row < size; row++) {
    matrix[row] = [];
    for (let col = 0; col < size; col++) {
      matrix[row][col] = Boolean(qr.modules.get(row, col));
    }
  }

  return matrix;
}

/**
 * Generate PNG image buffer for QR code.
 */
export async function createQRPng(
  text: string,
  options: QROptions = {}
): Promise<Buffer> {
  const ecc = options.ecc || "M";
  const margin = options.margin !== undefined ? options.margin : (options.small ? 2 : 4);
  const scale = options.scale || 8;

  return QRCode.toBuffer(text, {
    type: "png",
    errorCorrectionLevel: ecc,
    margin,
    scale,
    color: {
      dark: typeof options.foreground === "string" ? options.foreground : "#000000",
      light:
        options.background === "transparent"
          ? "#00000000"
          : typeof options.background === "string"
          ? options.background
          : "#ffffff",
    },
  });
}

/**
 * Generate inline terminal QR code string according to the requested protocol or auto-detection.
 */
export async function generateQR(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const requestedProtocol: TerminalProtocol = options.protocol || "auto";
  let resolvedProtocol: "kitty" | "iterm2" | "sixel" | "halfblock" | "fullblock" | "braille";

  if (requestedProtocol === "auto") {
    const caps = detectTerminalCapabilities();
    resolvedProtocol = caps.protocol;
  } else {
    resolvedProtocol = requestedProtocol;
  }

  switch (resolvedProtocol) {
    case "kitty": {
      const png = await createQRPng(text, options);
      return renderKitty(png, options);
    }
    case "iterm2": {
      const png = await createQRPng(text, options);
      return renderITerm2(png, options);
    }
    case "sixel": {
      const matrix = createQRMatrix(text, options.ecc);
      return renderSixel(matrix, options);
    }
    case "fullblock": {
      const matrix = createQRMatrix(text, options.ecc);
      return renderFullBlock(matrix, options);
    }
    case "braille": {
      const matrix = createQRMatrix(text, options.ecc);
      return renderBraille(matrix, options);
    }
    case "halfblock":
    default: {
      const matrix = createQRMatrix(text, options.ecc);
      return renderHalfBlock(matrix, options);
    }
  }
}

/**
 * Render QR code directly to standard output or specified stream.
 */
export async function renderQR(
  text: string,
  options: QROptions = {}
): Promise<void> {
  const output = await generateQR(text, options);
  const stream = options.stream || process.stdout;

  return new Promise((resolve, reject) => {
    stream.write(output, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
