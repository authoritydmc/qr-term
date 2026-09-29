import { TerminalCapabilities } from "./types.js";

/**
 * Detect terminal graphics capabilities across macOS, Linux, Windows,
 * including Kitty, Ghostty, WezTerm, iTerm2, VSCode terminal, Foot, XTerm, etc.
 */
export function detectTerminalCapabilities(): TerminalCapabilities {
  const env = process.env;
  const isTTY = Boolean(process.stdout && process.stdout.isTTY);

  // Environment overrides
  const explicitProtocol = env.QR_PROTOCOL?.toLowerCase();
  const term = env.TERM || "";
  const termProgram = (env.TERM_PROGRAM || "").toLowerCase();
  const lcTerminal = (env.LC_TERMINAL || "").toLowerCase();

  // 1. Kitty Graphics Protocol Detection
  const hasKitty =
    explicitProtocol === "kitty" ||
    Boolean(env.KITTY_WINDOW_ID) ||
    Boolean(env.KITTY_PID) ||
    term === "xterm-kitty" ||
    termProgram === "ghostty" ||
    termProgram === "wezterm";

  // 2. iTerm2 Inline Images Protocol Detection
  const hasITerm2 =
    explicitProtocol === "iterm2" ||
    termProgram === "iterm.app" ||
    termProgram === "iterm" ||
    termProgram === "wezterm" ||
    termProgram === "warp" ||
    termProgram === "tabby" ||
    termProgram === "mintty" ||
    lcTerminal === "iterm2" ||
    Boolean(env.ITERM_SESSION_ID);

  // 3. Sixel Graphics Detection
  const hasSixel =
    explicitProtocol === "sixel" ||
    term.includes("sixel") ||
    termProgram === "foot" ||
    termProgram === "mlterm" ||
    termProgram === "xterm" && Boolean(env.XTERM_VERSION);

  // Determine best protocol
  let protocol: "kitty" | "iterm2" | "sixel" | "halfblock" = "halfblock";

  if (explicitProtocol === "kitty" || (hasKitty && !explicitProtocol)) {
    protocol = "kitty";
  } else if (explicitProtocol === "iterm2" || (hasITerm2 && !explicitProtocol)) {
    protocol = "iterm2";
  } else if (explicitProtocol === "sixel" || (hasSixel && !explicitProtocol)) {
    protocol = "sixel";
  } else {
    protocol = "halfblock";
  }

  return {
    protocol,
    hasKitty,
    hasITerm2,
    hasSixel,
    isTTY,
    termProgram: env.TERM_PROGRAM,
  };
}
