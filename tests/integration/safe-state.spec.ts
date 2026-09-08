import { expect, test } from '@playwright/test';

import { SafeApiClient } from '../../src/clients/safe-api.client.js';
import { SafeProtocolClient } from '../../src/clients/safe-protocol.client.js';
import { loadReadOnlyConfig } from '../../src/config/environment.js';
import { reconcileSafeState } from '../../src/reconciliation/safe-state.js';

const requiredVariables = ['SAFE_API_KEY', 'SEPOLIA_RPC_URL', 'SAFE_ADDRESS'] as const;
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

test.describe('Safe API and on-chain state', () => {
  test.skip(
    missingVariables.length > 0,
    `Read-only environment is not configured: ${missingVariables.join(', ')}`,
  );

  test('Safe Transaction Service is available', async () => {
    const config = loadReadOnlyConfig();
    const apiClient = new SafeApiClient(config.apiKey);

    const service = await apiClient.getServiceInfo();

    expect(service.name).not.toBe('');
    expect(service.version).not.toBe('');
    expect(service.api_version).not.toBe('');
  });

  test('configured Safe is deployed on Sepolia', async () => {
    const config = loadReadOnlyConfig();
    const protocolClient = await SafeProtocolClient.connect(config.rpcUrl, config.safeAddress);

    await expect(protocolClient.isDeployed()).resolves.toBe(true);
  });

  test('critical Safe state agrees between API and blockchain', async () => {
    const config = loadReadOnlyConfig();
    const apiClient = new SafeApiClient(config.apiKey);
    const protocolClient = await SafeProtocolClient.connect(config.rpcUrl, config.safeAddress);

    const [apiInfo, onChainInfo] = await Promise.all([
      apiClient.getSafeInfo(config.safeAddress),
      protocolClient.getInfo(),
    ]);
    const result = reconcileSafeState(apiInfo, onChainInfo);

    expect(result.differences, 'API and on-chain state must agree').toEqual([]);
    expect(result.matches).toBe(true);
  });
});
