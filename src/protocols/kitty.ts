import { QROptions } from "../types.js";

const CHUNK_SIZE = 4096;

/**
 * Render PNG image using Kitty Graphics Protocol.
 * Supported by Kitty, Ghostty, WezTerm, etc.
 */
export function renderKitty(pngBuffer: Buffer, _options: QROptions = {}): string {
  const base64 = pngBuffer.toString("base64");
  const chunks: string[] = [];

  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    chunks.push(base64.slice(i, i + CHUNK_SIZE));
  }

  let result = "";
  for (let i = 0; i < chunks.length; i++) {
    const isFirst = i === 0;
    const isLast = i === chunks.length - 1;
    const more = isLast ? 0 : 1;

    if (isFirst) {
      // f=100 specifies PNG format, a=T means transmit and display
      result += `\x1b_Gf=100,a=T,m=${more};${chunks[i]}\x1b\\`;
    } else {
      result += `\x1b_Gm=${more};${chunks[i]}\x1b\\`;
    }
  }

  result += "\n";
  return result;
}
