import { exec, execFile, execSync } from "child_process";
import os from "os";

/**
 * Execute command and return stdout buffer
 */
function execBuffer(cmd: string, args: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { encoding: "buffer", maxBuffer: 50 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

/**
 * Reads plain text from the system clipboard.
 */
export async function readClipboardText(): Promise<string> {
  const platform = os.platform();

  if (platform === "darwin") {
    return new Promise((resolve, reject) => {
      exec("pbpaste", { encoding: "utf-8" }, (err, stdout) => {
        if (err) return reject(new Error(`Failed to read clipboard text: ${err.message}`));
        resolve(stdout);
      });
    });
  }

  if (platform === "win32") {
    return new Promise((resolve, reject) => {
      const psCommand = `powershell.exe -NoProfile -Command "[Console]::Out.Write((Get-Clipboard -Raw))"`;
      exec(psCommand, { encoding: "utf-8" }, (err, stdout) => {
        if (err) return reject(new Error(`Failed to read clipboard text: ${err.message}`));
        resolve(stdout);
      });
    });
  }

  // Linux / BSD / Unix
  return new Promise((resolve, reject) => {
    // Try Wayland first
    exec("wl-paste --no-newline", { encoding: "utf-8" }, (err, stdout) => {
      if (!err && stdout !== undefined) {
        return resolve(stdout);
      }
      // Try xclip
      exec("xclip -selection clipboard -o", { encoding: "utf-8" }, (err2, stdout2) => {
        if (!err2 && stdout2 !== undefined) {
          return resolve(stdout2);
        }
        // Try xsel
        exec("xsel --clipboard --output", { encoding: "utf-8" }, (err3, stdout3) => {
          if (!err3 && stdout3 !== undefined) {
            return resolve(stdout3);
          }
          reject(
            new Error(
              "Could not read clipboard. Please ensure 'wl-paste', 'xclip', or 'xsel' is installed."
            )
          );
        });
      });
    });
  });
}

/**
 * Reads image data (PNG buffer) from the system clipboard.
 */
export async function readClipboardImage(): Promise<Buffer> {
  const platform = os.platform();

  if (platform === "darwin") {
    // macOS: Use osascript to extract PNG hex data directly from clipboard
    return new Promise((resolve, reject) => {
      const script = `osascript -e 'try' -e 'get the clipboard as «class PNGf»' -e 'end try'`;
      exec(script, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }, (err, stdout) => {
        if (err || !stdout) {
          return reject(new Error("No image data found on clipboard."));
        }
        // stdout format: «data PNGf89504E47...»
        const match = stdout.match(/«data PNGf([0-9A-Fa-f]+)»/);
        if (match && match[1]) {
          return resolve(Buffer.from(match[1], "hex"));
        }
        reject(new Error("No valid PNG image found on clipboard."));
      });
    });
  }

  if (platform === "win32") {
    // Windows: Use PowerShell to extract Image to base64
    return new Promise((resolve, reject) => {
      const psCmd = `powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; if ([System.Windows.Forms.Clipboard]::ContainsImage()) { $img = [System.Windows.Forms.Clipboard]::GetImage(); $ms = New-Object System.IO.MemoryStream; $img.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); [Convert]::ToBase64String($ms.ToArray()) }"`;
      exec(psCmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }, (err, stdout) => {
        if (err || !stdout.trim()) {
          return reject(new Error("No image found on clipboard."));
        }
        try {
          resolve(Buffer.from(stdout.trim(), "base64"));
        } catch (e: any) {
          reject(new Error(`Failed to decode clipboard image: ${e.message}`));
        }
      });
    });
  }

  // Linux (Wayland / X11)
  try {
    const buf = await execBuffer("wl-paste", ["--type", "image/png"]);
    if (buf && buf.length > 0) return buf;
  } catch {}

  try {
    const buf = await execBuffer("xclip", ["-selection", "clipboard", "-t", "image/png", "-o"]);
    if (buf && buf.length > 0) return buf;
  } catch {}

  throw new Error(
    "No image data found on clipboard (or neither 'wl-paste' nor 'xclip' is installed)."
  );
}
