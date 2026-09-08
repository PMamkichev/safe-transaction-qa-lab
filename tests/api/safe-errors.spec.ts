import { HttpError } from '@safe-global/api-kit';
import { expect, test } from '@playwright/test';
import { zeroAddress } from 'viem';

import { SafeApiClient } from '../../src/clients/safe-api.client.js';
import { loadReadOnlyConfig } from '../../src/config/environment.js';

const requiredVariables = ['SAFE_API_KEY', 'SEPOLIA_RPC_URL', 'SAFE_ADDRESS'] as const;
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

test.describe('Safe Transaction Service errors', () => {
  test.skip(
    missingVariables.length > 0,
    `Read-only environment is not configured: ${missingVariables.join(', ')}`,
  );

  test('returns a typed not-found error for an unknown Safe', async () => {
    const config = loadReadOnlyConfig();
    const apiClient = new SafeApiClient(config.apiKey);

    const request = apiClient.getSafeInfo(zeroAddress);

    await expect(request).rejects.toBeInstanceOf(HttpError);
    await expect(request).rejects.toMatchObject({ statusCode: 404 });
  });
});
