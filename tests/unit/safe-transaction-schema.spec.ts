import { expect, test } from '@playwright/test';

import { safeTransactionEvidenceSchema } from '../../src/schemas/safe-transaction.schema.js';

const validTransaction = {
  safe: '0x1111111111111111111111111111111111111111',
  to: '0x2222222222222222222222222222222222222222',
  value: '1',
  nonce: '7',
  safeTxHash: `0x${'a'.repeat(64)}`,
  transactionHash: null,
  isExecuted: false,
  isSuccessful: null,
  confirmationsRequired: 2,
  confirmations: [
    {
      owner: '0x3333333333333333333333333333333333333333',
      signature: `0x${'b'.repeat(130)}`,
    },
  ],
  extraServiceField: 'allowed for forward compatibility',
};

test.describe('Safe transaction evidence schema', () => {
  test('accepts a valid pending transaction and preserves extra API fields', () => {
    const parsed = safeTransactionEvidenceSchema.parse(validTransaction);

    expect(parsed.isExecuted).toBe(false);
    expect(parsed.extraServiceField).toBe('allowed for forward compatibility');
  });

  test('rejects a malformed Safe transaction hash', () => {
    expect(() =>
      safeTransactionEvidenceSchema.parse({
        ...validTransaction,
        safeTxHash: '0x1234',
      }),
    ).toThrow(/transaction hash/);
  });

  test('rejects a negative value representation', () => {
    expect(() =>
      safeTransactionEvidenceSchema.parse({
        ...validTransaction,
        value: '-1',
      }),
    ).toThrow(/unsigned integer/);
  });
});
