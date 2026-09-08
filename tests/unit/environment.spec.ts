import { expect, test } from '@playwright/test';

import {
  ConfigurationError,
  loadReadOnlyConfig,
  loadSetupConfig,
  loadStatefulConfig,
} from '../../src/config/environment.js';

const safeAddress = '0x1111111111111111111111111111111111111111';
const recipientAddress = '0x2222222222222222222222222222222222222222';
const ownerAPrivateKey = `0x${'a'.repeat(64)}`;
const ownerBPrivateKey = `0x${'b'.repeat(64)}`;

test.describe('environment configuration', () => {
  test('loads the minimum read-only configuration', () => {
    const config = loadReadOnlyConfig({
      SAFE_API_KEY: 'test-api-key',
      SEPOLIA_RPC_URL: 'https://rpc.example.test',
      SAFE_ADDRESS: safeAddress,
    });

    expect(config).toEqual({
      apiKey: 'test-api-key',
      rpcUrl: 'https://rpc.example.test',
      safeAddress,
    });
  });

  test('does not require owner private keys for read-only tests', () => {
    expect(() =>
      loadReadOnlyConfig({
        SAFE_API_KEY: 'test-api-key',
        SEPOLIA_RPC_URL: 'https://rpc.example.test',
        SAFE_ADDRESS: safeAddress,
      }),
    ).not.toThrow();
  });

  test('rejects an invalid Safe address without printing configuration values', () => {
    const invalidApiKey = 'do-not-print-this-api-key';

    expect(() =>
      loadReadOnlyConfig({
        SAFE_API_KEY: invalidApiKey,
        SEPOLIA_RPC_URL: 'https://rpc.example.test',
        SAFE_ADDRESS: 'not-an-address',
      }),
    ).toThrow(ConfigurationError);

    try {
      loadReadOnlyConfig({
        SAFE_API_KEY: invalidApiKey,
        SEPOLIA_RPC_URL: 'https://rpc.example.test',
        SAFE_ADDRESS: 'not-an-address',
      });
    } catch (error) {
      expect(String(error)).toContain('SAFE_ADDRESS');
      expect(String(error)).not.toContain(invalidApiKey);
    }
  });

  test('requires an explicit opt-in for state-changing tests', () => {
    expect(() =>
      loadStatefulConfig({
        SAFE_API_KEY: 'test-api-key',
        SEPOLIA_RPC_URL: 'https://rpc.example.test',
        SAFE_ADDRESS: safeAddress,
        OWNER_A_PRIVATE_KEY: ownerAPrivateKey,
        OWNER_B_PRIVATE_KEY: ownerBPrivateKey,
        RECIPIENT_ADDRESS: recipientAddress,
        STATEFUL_TESTS_ENABLED: 'false',
      }),
    ).toThrow(/explicitly set to true/);
  });

  test('loads stateful secrets only after explicit opt-in', () => {
    const config = loadStatefulConfig({
      SAFE_API_KEY: 'test-api-key',
      SEPOLIA_RPC_URL: 'https://rpc.example.test',
      SAFE_ADDRESS: safeAddress,
      OWNER_A_PRIVATE_KEY: ownerAPrivateKey,
      OWNER_B_PRIVATE_KEY: ownerBPrivateKey,
      RECIPIENT_ADDRESS: recipientAddress,
      STATEFUL_TESTS_ENABLED: 'true',
    });

    expect(config.safeAddress).toBe(safeAddress);
    expect(config.recipientAddress).toBe(recipientAddress);
    expect(config.ownerAPrivateKey).toBe(ownerAPrivateKey);
  });

  test('loads deployment setup without requiring an API key or deployed Safe', () => {
    const config = loadSetupConfig({
      SEPOLIA_RPC_URL: 'https://rpc.example.test',
      OWNER_A_PRIVATE_KEY: ownerAPrivateKey,
      OWNER_B_PRIVATE_KEY: ownerBPrivateKey,
    });

    expect(config).toEqual({
      rpcUrl: 'https://rpc.example.test',
      ownerAPrivateKey,
      ownerBPrivateKey,
    });
  });
});
