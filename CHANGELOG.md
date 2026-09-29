# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-09-29

### Added
- Multi-protocol inline terminal graphics engine:
  - **Kitty Graphics Protocol** (Ghostty, Kitty, WezTerm).
  - **iTerm2 Inline Images Protocol** (iTerm2, VSCode Terminal, Warp, Tabby, Mintty).
  - **Sixel Graphics Protocol** (XTerm, Foot, mlterm, WezTerm).
  - **Half-Block Unicode ▀** with truecolor ANSI optimization and square aspect ratio.
  - **Full-Block & Braille** compact rendering formats.
- Automatic terminal emulator feature detection.
- Command-line interface (`qr-term` and `qrx`) with piping support and customizable color/margin/ECC flags.
- Dual ESM and CommonJS library distribution with TypeScript types.
- GitHub Actions CI matrix (Linux, macOS, Windows) and automated release workflow.
