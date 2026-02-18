import { describe, expect, it } from 'vitest';
import {
  CTRL_J_ASCII,
  isLinuxPlatform,
  shouldHandleLinuxCtrlShiftPaste,
  shouldMapShiftEnterToCtrlJ,
  type KeyEventLike,
} from '../../renderer/terminal/terminalKeybindings';

describe('TerminalSessionManager - Shift+Enter to Ctrl+J mapping', () => {
  const makeEvent = (overrides: Partial<KeyEventLike> = {}): KeyEventLike => ({
    type: 'keydown',
    key: 'Enter',
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...overrides,
  });

  it('maps Shift+Enter to Ctrl+J only', () => {
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ shiftKey: true }))).toBe(true);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ shiftKey: false }))).toBe(false);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ shiftKey: true, ctrlKey: true }))).toBe(false);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ shiftKey: true, metaKey: true }))).toBe(false);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ shiftKey: true, altKey: true }))).toBe(false);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ key: 'a', shiftKey: true }))).toBe(false);
    expect(shouldMapShiftEnterToCtrlJ(makeEvent({ type: 'keyup', shiftKey: true }))).toBe(false);
  });

  it('uses line feed for Ctrl+J', () => {
    expect(CTRL_J_ASCII).toBe('\n');
  });

  it('detects Linux platform names', () => {
    expect(isLinuxPlatform('Linux x86_64')).toBe(true);
    expect(isLinuxPlatform('linux')).toBe(true);
    expect(isLinuxPlatform('MacIntel')).toBe(false);
    expect(isLinuxPlatform('Win32')).toBe(false);
  });

  it('matches Linux Ctrl+Shift+V paste shortcut only', () => {
    const event = makeEvent({ key: 'V', shiftKey: true, ctrlKey: true });

    expect(shouldHandleLinuxCtrlShiftPaste(event, 'Linux')).toBe(true);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, key: 'v' }, 'Linux')).toBe(true);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, shiftKey: false }, 'Linux')).toBe(false);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, ctrlKey: false }, 'Linux')).toBe(false);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, altKey: true }, 'Linux')).toBe(false);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, metaKey: true }, 'Linux')).toBe(false);
    expect(shouldHandleLinuxCtrlShiftPaste({ ...event, type: 'keyup' }, 'Linux')).toBe(false);
    expect(shouldHandleLinuxCtrlShiftPaste(event, 'MacIntel')).toBe(false);
  });
});
