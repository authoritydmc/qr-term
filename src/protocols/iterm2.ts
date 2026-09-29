import { QROptions } from "../types.js";

/**
 * Render PNG image using iTerm2 Inline Images Protocol (OSC 1337).
 * Supported by iTerm2, WezTerm, Warp, Tabby, VSCode Terminal, Mintty.
 */
export function renderITerm2(pngBuffer: Buffer, options: QROptions = {}): string {
  const base64 = pngBuffer.toString("base64");
  const width = options.scale ? `${options.scale * 10}px` : "auto";
  return `\x1b]1337;File=inline=1;width=${width};preserveAspectRatio=1:${base64}\x07\n`;
}
