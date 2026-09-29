import test from "node:test";
import assert from "node:assert";
import {
  createQRMatrix,
  createQRPng,
  generateQR,
  detectTerminalCapabilities,
  renderHalfBlock,
  renderFullBlock,
  renderBraille,
  renderITerm2,
  renderKitty,
  renderSixel,
} from "../index.js";

test("createQRMatrix returns a valid 2D boolean grid", () => {
  const matrix = createQRMatrix("https://github.com", "M");
  assert.ok(Array.isArray(matrix));
  assert.ok(matrix.length > 0);
  assert.strictEqual(matrix.length, matrix[0].length);
  // Modules should contain both true and false values
  const hasDark = matrix.some((row) => row.some((val) => val === true));
  const hasLight = matrix.some((row) => row.some((val) => val === false));
  assert.ok(hasDark);
  assert.ok(hasLight);
});

test("createQRPng returns valid PNG buffer", async () => {
  const png = await createQRPng("https://github.com");
  assert.ok(Buffer.isBuffer(png));
  // PNG signature check 0x89 0x50 0x4E 0x47
  assert.strictEqual(png[0], 0x89);
  assert.strictEqual(png[1], 0x50);
  assert.strictEqual(png[2], 0x4e);
  assert.strictEqual(png[3], 0x47);
});

test("detectTerminalCapabilities returns capability object", () => {
  const caps = detectTerminalCapabilities();
  assert.ok("protocol" in caps);
  assert.ok("hasKitty" in caps);
  assert.ok("hasITerm2" in caps);
  assert.ok("hasSixel" in caps);
  assert.ok("isTTY" in caps);
});

test("renderHalfBlock generates valid halfblock string", () => {
  const matrix = createQRMatrix("hello", "L");
  const output = renderHalfBlock(matrix, { margin: 2 });
  assert.ok(output.includes("▀"));
  assert.ok(output.includes("\x1b[0m"));
});

test("renderFullBlock generates valid block string", () => {
  const matrix = createQRMatrix("hello", "L");
  const output = renderFullBlock(matrix, { margin: 1 });
  assert.ok(output.includes("\x1b[48;2;"));
  assert.ok(output.includes("\x1b[0m"));
});

test("renderBraille generates unicode braille characters", () => {
  const matrix = createQRMatrix("hello", "L");
  const output = renderBraille(matrix, { margin: 1 });
  assert.ok(output.length > 0);
});

test("renderITerm2 generates valid OSC 1337 sequence", async () => {
  const png = await createQRPng("hello");
  const output = renderITerm2(png);
  assert.ok(output.startsWith("\x1b]1337;File=inline=1;"));
  assert.ok(output.endsWith("\x07\n"));
});

test("renderKitty generates valid Kitty APC sequence", async () => {
  const png = await createQRPng("hello");
  const output = renderKitty(png);
  assert.ok(output.startsWith("\x1b_Gf=100,a=T,m="));
  assert.ok(output.includes("\x1b\\"));
});

test("renderSixel generates valid Sixel DCS sequence", () => {
  const matrix = createQRMatrix("hello", "L");
  const output = renderSixel(matrix);
  assert.ok(output.startsWith("\x1bPq"));
  assert.ok(output.endsWith("\x1b\\\n"));
});

test("generateQR handles auto and explicit protocols", async () => {
  const hb = await generateQR("https://github.com", { protocol: "halfblock" });
  assert.ok(hb.includes("▀"));

  const six = await generateQR("https://github.com", { protocol: "sixel" });
  assert.ok(six.startsWith("\x1bPq"));

  const iterm = await generateQR("https://github.com", { protocol: "iterm2" });
  assert.ok(iterm.startsWith("\x1b]1337;"));

  const kitty = await generateQR("https://github.com", { protocol: "kitty" });
  assert.ok(kitty.startsWith("\x1b_G"));
});

test("decodeQR decodes PNG image buffer correctly", async () => {
  const payload = "https://github.com/authoritydmc/qr-term";
  const png = await createQRPng(payload);
  const result = await import("../index.js").then((m) => m.decodeQR(png));
  assert.strictEqual(result.data, payload);
  assert.ok(result.version > 0);
  assert.ok(result.location.topLeftCorner.x !== undefined);
});

