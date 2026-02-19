/**
 * tests/appRegistry.test.ts
 *
 * Unit tests for the App Registry store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppRegistryStore } from '@/system/appRegistry';
import type { AppManifest } from '@/system/appRegistry';

const mockApp: AppManifest = {
  id: 'test.app',
  name: 'Test App',
  icon: '',
  description: 'A test application',
  component: () => null,
};

beforeEach(() => {
  useAppRegistryStore.setState({ apps: [] });
});

describe('App Registry', () => {
  it('registers an app', () => {
    useAppRegistryStore.getState().register(mockApp);
    expect(useAppRegistryStore.getState().apps).toHaveLength(1);
  });

  it('prevents duplicate registration', () => {
    const { register } = useAppRegistryStore.getState();
    register(mockApp);
    register(mockApp);
    expect(useAppRegistryStore.getState().apps).toHaveLength(1);
  });

  it('retrieves an app by id', () => {
    useAppRegistryStore.getState().register(mockApp);
    const found = useAppRegistryStore.getState().getApp('test.app');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test App');
  });

  it('returns undefined for unknown app id', () => {
    const found = useAppRegistryStore.getState().getApp('no.such.app');
    expect(found).toBeUndefined();
  });

  it('unregisters an app', () => {
    const store = useAppRegistryStore.getState();
    store.register(mockApp);
    store.unregister('test.app');
    expect(useAppRegistryStore.getState().apps).toHaveLength(0);
  });

  it('registers multiple apps', () => {
    const store = useAppRegistryStore.getState();
    store.register(mockApp);
    store.register({ ...mockApp, id: 'test.app2', name: 'Test App 2' });
    expect(useAppRegistryStore.getState().apps).toHaveLength(2);
  });
});
