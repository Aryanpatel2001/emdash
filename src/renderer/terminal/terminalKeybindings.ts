export type KeyEventLike = {
  type: string;
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

// Ctrl+J sends line feed (LF) to the PTY, which CLI agents interpret as a newline
export const CTRL_J_ASCII = '\x0A';

const DEFAULT_PLATFORM =
  typeof navigator !== 'undefined'
    ? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform || navigator.platform
    : '';

export function isLinuxPlatform(platform: string = DEFAULT_PLATFORM): boolean {
  return platform.toLowerCase().includes('linux');
}

export function shouldMapShiftEnterToCtrlJ(event: KeyEventLike): boolean {
  return (
    event.type === 'keydown' &&
    event.key === 'Enter' &&
    event.shiftKey === true &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  );
}

/**
 * Linux terminals conventionally use Ctrl+Shift+V for paste.
 * We handle it explicitly to trigger Electron's native paste path.
 */
export function shouldHandleLinuxCtrlShiftPaste(
  event: KeyEventLike,
  platform: string = DEFAULT_PLATFORM
): boolean {
  return (
    isLinuxPlatform(platform) &&
    event.type === 'keydown' &&
    event.key.toLowerCase() === 'v' &&
    event.ctrlKey === true &&
    event.shiftKey === true &&
    !event.metaKey &&
    !event.altKey
  );
}
