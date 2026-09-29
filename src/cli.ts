import { Command } from "commander";
import { generateQR, renderQR } from "./core.js";
import { TerminalProtocol, ErrorCorrectionLevel } from "./types.js";
import { detectTerminalCapabilities } from "./detector.js";
import fs from "fs";

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim());
    });
    // Timeout if nothing comes through stdin
    setTimeout(() => {
      if (!data) resolve("");
    }, 100);
  });
}

async function main() {
  const program = new Command();

  program
    .name("qr-term")
    .description(
      "High-fidelity inline QR code generator & terminal renderer supporting Kitty, iTerm2, Sixel, Half-Block Unicode, and Braille graphics."
    )
    .version("1.0.0", "-v, --version", "Output the current version")
    .argument("[text]", "Text or URL to encode in QR code")
    .option(
      "-p, --protocol <protocol>",
      "Terminal graphics protocol (auto, kitty, iterm2, sixel, halfblock, fullblock, braille)",
      "auto"
    )
    .option(
      "-e, --ecc <level>",
      "Error correction level (L, M, Q, H)",
      "M"
    )
    .option("-m, --margin <number>", "Quiet zone margin in modules", (val) => parseInt(val, 10))
    .option("-s, --scale <number>", "Scale multiplier for image protocols", (val) => parseInt(val, 10))
    .option("--small", "Compact display mode", false)
    .option("-i, --invert", "Invert foreground and background colors", false)
    .option("--fg <color>", "Foreground color (hex or rgb)")
    .option("--bg <color>", "Background color (hex or rgb or transparent)")
    .option("--info", "Display detected terminal graphics capabilities and exit")
    .action(async (textArg, options) => {
      try {
        if (options.info) {
          const caps = detectTerminalCapabilities();
          console.log("Terminal Graphics Capabilities:");
          console.log(`  TTY: ${caps.isTTY}`);
          console.log(`  Terminal Program: ${caps.termProgram || "unknown"}`);
          console.log(`  Kitty Protocol: ${caps.hasKitty ? "Supported" : "No"}`);
          console.log(`  iTerm2 Protocol: ${caps.hasITerm2 ? "Supported" : "No"}`);
          console.log(`  Sixel Protocol: ${caps.hasSixel ? "Supported" : "No"}`);
          console.log(`  Resolved Protocol: ${caps.protocol}`);
          process.exit(0);
        }

        let input = textArg;
        if (!input) {
          input = await readStdin();
        }

        if (!input) {
          program.help();
          process.exit(1);
        }

        await renderQR(input, {
          protocol: options.protocol as TerminalProtocol,
          ecc: options.ecc as ErrorCorrectionLevel,
          margin: options.margin,
          scale: options.scale,
          small: options.small,
          invert: options.invert,
          foreground: options.fg,
          background: options.bg,
        });
      } catch (err: any) {
        console.error(`\x1b[31mError: ${err.message || err}\x1b[0m`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
