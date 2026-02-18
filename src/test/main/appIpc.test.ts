import { beforeEach, describe, expect, it, vi } from 'vitest';

const ipcHandleHandlers = new Map<string, (...args: any[]) => any>();

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    on: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn((channel: string, cb: (...args: any[]) => any) => {
      ipcHandleHandlers.set(channel, cb);
    }),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

vi.mock('../../main/services/DatabaseService', () => ({
  databaseService: {
    getSshConnection: vi.fn(),
  },
}));

vi.mock('../../main/settings', () => ({
  getAppSettings: vi.fn(() => ({
    defaultOpenInApp: 'terminal',
  })),
}));

vi.mock('../../main/services/ProjectPrep', () => ({
  ensureProjectPrepared: vi.fn(async () => ({ success: true })),
}));

vi.mock('../../main/utils/childProcessEnv', () => ({
  buildExternalToolEnv: vi.fn(() => process.env),
}));

describe('appIpc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    ipcHandleHandlers.clear();
  });

  it('handles app:paste by calling sender.paste', async () => {
    const { registerAppIpc } = await import('../../main/ipc/appIpc');
    registerAppIpc();

    const handler = ipcHandleHandlers.get('app:paste');
    expect(handler).toBeTypeOf('function');

    const sender = { paste: vi.fn() };
    const result = await handler!({ sender });

    expect(sender.paste).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('returns error when sender.paste throws', async () => {
    const { registerAppIpc } = await import('../../main/ipc/appIpc');
    registerAppIpc();

    const handler = ipcHandleHandlers.get('app:paste');
    expect(handler).toBeTypeOf('function');

    const sender = {
      paste: vi.fn(() => {
        throw new Error('paste failed');
      }),
    };
    const result = await handler!({ sender });

    expect(sender.paste).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: false, error: 'paste failed' });
  });
});
