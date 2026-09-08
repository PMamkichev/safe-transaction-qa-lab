import { expect, test } from '@playwright/test';

import { safeInfoSchema } from '../../src/schemas/safe-info.schema.js';

const validResponse = {
  address: '0x1111111111111111111111111111111111111111',
  nonce: '42',
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

test.describe('Safe info API schema', () => {
  test('parses critical fields and converts nonce to bigint', () => {
    const parsed = safeInfoSchema.parse(validResponse);

    expect(parsed.nonce).toBe(42n);
    expect(parsed.threshold).toBe(2);
    expect(parsed.owners).toHaveLength(2);
  });

  test('rejects a response with an invalid owner', () => {
    const response = {
      ...validResponse,
      owners: ['invalid-owner'],
    };

    expect(() => safeInfoSchema.parse(response)).toThrow(/valid EVM address/);
  });

  test('rejects a negative nonce', () => {
    const response = {
      ...validResponse,
      nonce: '-1',
    };

    expect(() => safeInfoSchema.parse(response)).toThrow(/unsigned integer/);
  });

  test('rejects a non-positive signature threshold', () => {
    const response = {
      ...validResponse,
      threshold: 0,
    };

    expect(() => safeInfoSchema.parse(response)).toThrow();
  });
});
