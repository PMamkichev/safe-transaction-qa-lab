import { expect, test } from '@playwright/test';
import type { Address } from 'viem';

import type { OnChainSafeInfo } from '../../src/clients/safe-protocol.client.js';
import { reconcileSafeState } from '../../src/reconciliation/safe-state.js';
import type { SafeInfo } from '../../src/schemas/safe-info.schema.js';

const apiInfo: SafeInfo = {
  address: '0x1111111111111111111111111111111111111111',
  nonce: 7n,
  threshold: 2,
  owners: [
    '0x2222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333',
  ],
  singleton: '0x4444444444444444444444444444444444444444',
  modules: [],
  fallbackHandler: '0x5555555555555555555555555555555555555555',
  guard: '0x0000000000000000000000000000000000000000',
  version: '1.4.1',
};

function onChainInfo(overrides: Partial<OnChainSafeInfo> = {}): OnChainSafeInfo {
  return {
    address: apiInfo.address,
    nonce: apiInfo.nonce,
    threshold: apiInfo.threshold,
    owners: [...apiInfo.owners],
    version: apiInfo.version,
    ...overrides,
  };
}

test.describe('Safe state reconciliation', () => {
  test('matches equal API and on-chain observations regardless of owner order', () => {
    const result = reconcileSafeState(
      apiInfo,
      onChainInfo({ owners: [...apiInfo.owners].reverse() }),
    );

    expect(result).toEqual({ matches: true, differences: [] });
  });

  test('treats Safe L2 build metadata as the same base contract version', () => {
    const result = reconcileSafeState(
      { ...apiInfo, version: '1.4.1+L2' },
      onChainInfo({ version: '1.4.1' }),
    );

    expect(result).toEqual({ matches: true, differences: [] });
  });

  test('reports each inconsistent critical field', () => {
    const differentOwner = '0x9999999999999999999999999999999999999999' as Address;
    const result = reconcileSafeState(
      apiInfo,
      onChainInfo({
        nonce: 8n,
        threshold: 1,
        owners: [differentOwner],
        version: '1.3.0',
      }),
    );

    expect(result.matches).toBe(false);
    expect(result.differences).toHaveLength(4);
    expect(result.differences.join('\n')).toContain('nonce');
    expect(result.differences.join('\n')).toContain('threshold');
    expect(result.differences.join('\n')).toContain('owners');
    expect(result.differences.join('\n')).toContain('version');
  });
});
