import { expect, test } from '@playwright/test';

import { PollingTimeoutError, pollUntil } from '../../src/helpers/poll-until.js';

test.describe('pollUntil', () => {
  test('returns the first value that satisfies the readiness condition', async () => {
    let attempt = 0;

    const result = await pollUntil({
      operation: async () => {
        attempt += 1;
        return attempt;
      },
      isReady: (value) => value === 3,
      timeoutMs: 100,
      intervalMs: 1,
      description: 'counter to reach three',
    });

    expect(result).toBe(3);
    expect(attempt).toBe(3);
  });

  test('throws a diagnostic error after the bounded timeout', async () => {
    const action = pollUntil({
      operation: async () => 'pending',
      isReady: (value) => value === 'ready',
      timeoutMs: 10,
      intervalMs: 2,
      description: 'transaction indexing',
    });

    await expect(action).rejects.toBeInstanceOf(PollingTimeoutError);
    await expect(action).rejects.toThrow(/transaction indexing/);
  });
});
