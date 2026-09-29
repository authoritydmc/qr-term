import fs from "fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";
import jsQR from "jsqr";
import { QRDecodeResult, QRDecodeOptions } from "./types.js";

/**
 * Parses raw image buffer (PNG, JPEG, or raw RGBA) into width, height, and RGBA pixel data.
 */
export function parseImageBuffer(buffer: Buffer | Uint8Array): {
  data: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // Check PNG magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    nodeBuf.length >= 8 &&
    nodeBuf[0] === 0x89 &&
    nodeBuf[1] === 0x50 &&
    nodeBuf[2] === 0x4e &&
    nodeBuf[3] === 0x47
  ) {
    const png = PNG.sync.read(nodeBuf);
    return {
      data: new Uint8ClampedArray(png.data),
      width: png.width,
      height: png.height,
    };
  }

  // Check JPEG magic bytes: 0xFF 0xD8 0xFF
  if (
    nodeBuf.length >= 3 &&
    nodeBuf[0] === 0xff &&
    nodeBuf[1] === 0xd8 &&
    nodeBuf[2] === 0xff
  ) {
    const rawJpeg = jpeg.decode(nodeBuf, { useTArray: true });
    return {
      data: new Uint8ClampedArray(rawJpeg.data),
      width: rawJpeg.width,
      height: rawJpeg.height,
    };
  }

  // Fallback: try parsing with PNG, then JPEG
  try {
    const png = PNG.sync.read(nodeBuf);
    return {
      data: new Uint8ClampedArray(png.data),
      width: png.width,
      height: png.height,
    };
  } catch {
    try {
      const rawJpeg = jpeg.decode(nodeBuf, { useTArray: true });
      return {
        data: new Uint8ClampedArray(rawJpeg.data),
        width: rawJpeg.width,
        height: rawJpeg.height,
      };
    } catch {
      throw new Error("Unsupported image format. Supported formats: PNG, JPEG.");
    }
  }
}

/**
 * Decode QR code from an image buffer or file path.
 */
export async function decodeQR(
  input: string | Buffer | Uint8Array,
  options: QRDecodeOptions = {}
): Promise<QRDecodeResult> {
  let buffer: Buffer | Uint8Array;

  if (typeof input === "string") {
    if (!fs.existsSync(input)) {
      throw new Error(`File not found: ${input}`);
    }
    buffer = await fs.promises.readFile(input);
  } else {
    buffer = input;
  }

  const { data, width, height } = parseImageBuffer(buffer);

  const qr = jsQR(data, width, height, {
    inversionAttempts: options.inversionAttempts || "attemptBoth",
  });

  if (!qr) {
    throw new Error("No QR code found in the image.");
  }

  return {
    data: qr.data,
    binaryData: qr.binaryData,
    version: qr.version,
    location: qr.location,
  };
}
