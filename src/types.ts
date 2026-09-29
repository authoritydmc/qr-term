export type TerminalProtocol =
  | "auto"
  | "kitty"
  | "iterm2"
  | "sixel"
  | "halfblock"
  | "fullblock"
  | "braille";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface QROptions {
  /**
   * Terminal rendering protocol to use.
   * Default: "auto" (detects best protocol supported by the terminal).
   */
  protocol?: TerminalProtocol;

  /**
   * QR Error correction level: 'L' (7%), 'M' (15%), 'Q' (25%), 'H' (30%).
   * Default: 'M'
   */
  ecc?: ErrorCorrectionLevel;

  /**
   * Margin / quiet zone in modules.
   * Default: 2 for Unicode halfblock, 4 for image protocols.
   */
  margin?: number;

  /**
   * Target scale / width (modules per pixel or character width).
   */
  scale?: number;

  /**
   * Invert foreground and background colors.
   * Useful when running in light/dark terminals.
   * Default: false
   */
  invert?: boolean;

  /**
   * Foreground color (Hex string like '#000000', or RGB object).
   * Default: '#000000'
   */
  foreground?: string | RGBColor;

  /**
   * Background color (Hex string like '#ffffff', or RGB object, or 'transparent').
   * Default: '#ffffff'
   */
  background?: string | RGBColor | "transparent";

  /**
   * Small / compact rendering mode (shorthand for halfblock with margin 1).
   */
  small?: boolean;

  /**
   * Output stream to write to (used by renderQR).
   * Default: process.stdout
   */
  stream?: NodeJS.WritableStream;
}

export interface QRMatrix {
  size: number;
  data: Uint8Array; // 1 for black (dark module), 0 for white (light module)
}

export interface TerminalCapabilities {
  protocol: "kitty" | "iterm2" | "sixel" | "halfblock";
  hasKitty: boolean;
  hasITerm2: boolean;
  hasSixel: boolean;
  isTTY: boolean;
  termProgram?: string;
}
