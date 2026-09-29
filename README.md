# qr-term 📲

[![CI](https://github.com/authoritydmc/qr-term/actions/workflows/ci.yml/badge.svg)](https://github.com/authoritydmc/qr-term/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/qr-term.svg?style=flat&color=brightgreen)](https://www.npmjs.com/package/qr-term)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **High-fidelity inline QR code generator & terminal renderer** with automatic protocol detection across macOS, Linux, and Windows (Kitty, iTerm2, Sixel, Half-Block Unicode, and Braille).

Designed both as an **interactive CLI utility** and a **zero-fuss library** for CLI applications (e.g. 2FA login prompts, payment links, pairing codes, Wi-Fi share, and crypto addresses).

---

## ✨ Features

- 🖥️ **Universal Terminal Support**: Automatically detects and uses the highest-quality rendering protocol available in your current terminal.
- 🎨 **Multi-Protocol Engine**:
  - **Kitty Graphics Protocol** (Ghostty, Kitty, WezTerm) — native pixel-perfect rendering.
  - **iTerm2 Inline Images** (iTerm2, VS Code Terminal, Warp, Tabby, Mintty) — crisp PNG inline graphics.
  - **Sixel Graphics** (Foot, XTerm, mlterm, WezTerm) — hardware-level bitmap terminal rendering.
  - **Half-Block Unicode (`▀`)** — universal 1:1 square pixel aspect ratio on any shell (PowerShell, Bash, Zsh, CMD, PuTTY, CI runners).
  - **Compact Braille (`⠓⠚`)** — ultra-compact micro matrix for tight spaces.
- 🌈 **Full ANSI 24-Bit Truecolor & Monochrome**: Custom foreground/background colors with ANSI sequence optimization.
- 📦 **Dual ESM & CommonJS**: Full TypeScript definitions (`.d.ts`) included out of the box.
- ⚡ **Zero Native C++ Build Dependencies**: Runs anywhere Node.js runs with pure JavaScript/TypeScript.
- 🚰 **Pipe-Friendly CLI**: Supports both direct arguments and standard input pipes.

---

## 💻 Terminal Compatibility Matrix

| Terminal Emulator / Shell | Default Protocol | Truecolor / Images | Supported OS |
| :--- | :--- | :--- | :--- |
| **Kitty** | `kitty` | High-Res PNG | macOS / Linux |
| **Ghostty** | `kitty` | High-Res PNG | macOS / Linux |
| **iTerm2** | `iterm2` | High-Res PNG | macOS |
| **WezTerm** | `kitty` / `iterm2` | High-Res PNG / Sixel | macOS / Linux / Windows |
| **VS Code Terminal** | `iterm2` / `halfblock` | Inline PNG / Unicode | macOS / Linux / Windows |
| **Warp** | `iterm2` | Inline PNG | macOS / Linux |
| **Foot / mlterm** | `sixel` | Sixel Bitmap | Linux |
| **Windows Terminal / PowerShell** | `halfblock` | Truecolor Half-Block | Windows |
| **Apple Terminal (`Terminal.app`)** | `halfblock` | Truecolor Half-Block | macOS |
| **Linux TTY / Bash / Zsh** | `halfblock` | Truecolor Half-Block | Linux |
| **CI / Headless Runners** | `halfblock` | 16-Color / Monochrome | Any |

---

## 🚀 Installation

### Global CLI Tool
```bash
npm install -g qr-term
# or
npx qr-term "https://example.com"
```

### In Your Project (Library)
```bash
npm install qr-term
# or
pnpm add qr-term
# or
yarn add qr-term
```

---

## 🛠️ CLI Usage

```bash
# Basic usage
qr-term "https://github.com"

# Using alias
qrx "https://github.com"

# Piped input
echo "https://my-auth-link.com" | qr-term

# Custom protocol
qr-term "https://github.com" --protocol kitty
qr-term "https://github.com" --protocol iterm2
qr-term "https://github.com" --protocol sixel
qr-term "https://github.com" --protocol halfblock
qr-term "https://github.com" --protocol braille

# Compact mode (reduced margin)
qr-term "https://github.com" --small

# Custom Colors (Hex or RGB)
qr-term "https://github.com" --fg "#00ffff" --bg "#0f172a"

# Error correction level (L = 7%, M = 15%, Q = 25%, H = 30%)
qr-term "https://github.com" --ecc H

# Inspect detected terminal capabilities
qr-term --info
```

---

## 📖 Programmatic API (TypeScript & JavaScript)

### 1. Print directly to terminal (Auto Protocol)
```typescript
import { renderQR } from "qr-term";

await renderQR("https://github.com/authoritydmc/qr-term");
```

### 2. Capture formatted string (e.g. for CLI layouts / boxes)
```typescript
import { generateQR } from "qr-term";

const qrCode = await generateQR("https://auth.company.com/pair?code=88310", {
  protocol: "halfblock",
  small: true,
  foreground: "#38bdf8",
  background: "transparent",
});

console.log(qrCode);
```

### 3. Check terminal capabilities programmatically
```typescript
import { detectTerminalCapabilities } from "qr-term";

const caps = detectTerminalCapabilities();
console.log(caps);
// {
//   protocol: 'iterm2',
//   hasKitty: false,
//   hasITerm2: true,
//   hasSixel: false,
//   isTTY: true,
//   termProgram: 'iTerm.app'
// }
```

### 4. Raw QR Matrix Extraction
```typescript
import { createQRMatrix } from "qr-term";

const matrix = createQRMatrix("Hello World", "M");
// 2D boolean array: matrix[row][col] === true for dark module
```

---

## ⚙️ Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `protocol` | `"auto" \| "kitty" \| "iterm2" \| "sixel" \| "halfblock" \| "fullblock" \| "braille"` | `"auto"` | Terminal graphics protocol |
| `ecc` | `"L" \| "M" \| "Q" \| "H"` | `"M"` | QR error correction level |
| `margin` | `number` | `2` (halfblock) / `4` (images) | Quiet zone border width in modules |
| `small` | `boolean` | `false` | Enable compact margin & padding |
| `invert` | `boolean` | `false` | Invert foreground and background colors |
| `foreground` | `string \| RGBColor` | `"#000000"` | Module foreground color (Hex or RGB) |
| `background` | `string \| RGBColor \| "transparent"` | `"#ffffff"` | Background color |
| `scale` | `number` | `8` | Scale factor for image/sixel rendering |
| `stream` | `WritableStream` | `process.stdout` | Target output stream for `renderQR` |

---

## 🧪 Development & Testing

```bash
# Clone the repository
git clone https://github.com/authoritydmc/qr-term.git
cd qr-term

# Install dependencies
npm install

# Run automated tests
npm test

# Build dual ESM/CJS & TypeScript declaration bundles
npm run build
```

---

## 🚀 Automated Release & Versioning

You can bump the version, create git tags, and release packages in two automated ways:

### Method 1: From GitHub Actions Web UI (1-Click)
1. Go to **Actions** -> **Automated Version & Release**.
2. Click **Run workflow**.
3. Choose release bump type: `patch` (e.g. `1.0.1`), `minor` (`1.1.0`), or `major` (`2.0.0`).
4. Click **Run workflow**. The action will automatically run tests, bump `package.json`, commit, create git tag `vX.Y.Z`, push, publish to NPM, and create a GitHub Release with release notes!

### Method 2: From Terminal
```bash
# Bumps version, creates git tag, and pushes to origin
npm run release:patch  # for bug fixes / patches
npm run release:minor  # for new features
npm run release:major  # for breaking changes
```
GitHub Actions will automatically pick up the pushed tag and publish the release to NPM & GitHub Releases.

---

## 📄 License

[MIT](LICENSE) © 2026
