/**
 * tests/setup.ts
 *
 * Global test setup for Vitest + jsdom.
 * Adds Testing Library custom matchers and mocks browser APIs
 * that aren't available in jsdom.
 */

import '@testing-library/jest-dom';

// Mock IndexedDB (used by fileSystem) – jsdom doesn't implement it
// We use a minimal in-memory shim so IDB calls don't throw.
// A full IDB mock would use `fake-indexeddb`, but for these unit tests
// we mock at the module level instead.
vi.mock('@/system/fileSystem', () => ({
  fileSystem: {
    init: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    ls: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(true),
  },
}));

// Suppress noisy console.error in test output from React
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
