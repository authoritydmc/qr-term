import { renderQR, generateQR } from "../src/index.js";

async function main() {
  console.log("=== 1. Direct Terminal Render (Auto Protocol) ===");
  await renderQR("https://github.com/username/qr-term");

  console.log("\n=== 2. Compact / Small Halfblock ===");
  await renderQR("https://github.com/username/qr-term", {
    protocol: "halfblock",
    small: true,
  });

  console.log("\n=== 3. Custom Truecolor (Cyan / Dark Blue) ===");
  await renderQR("https://github.com/username/qr-term", {
    protocol: "halfblock",
    foreground: "#00ffff",
    background: "#0d1117",
  });

  console.log("\n=== 4. Capture Output as String (For formatting / CLI boxes) ===");
  const qrString = await generateQR("otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example", {
    protocol: "halfblock",
    small: true,
  });

  console.log("Generated QR snippet size:", qrString.length, "bytes");
}

main().catch(console.error);
