export type PollUntilOptions<T> = {
  operation: () => Promise<T>;
  isReady: (value: T) => boolean;
  timeoutMs: number;
  intervalMs: number;
  description: string;
};

export class PollingTimeoutError extends Error {
  constructor(description: string, timeoutMs: number, attempts: number) {
    super(`Timed out waiting for ${description} after ${timeoutMs} ms and ${attempts} attempts`);
    this.name = 'PollingTimeoutError';
  }
}

export async function pollUntil<T>({
  operation,
  isReady,
  timeoutMs,
  intervalMs,
  description,
}: PollUntilOptions<T>): Promise<T> {
  const startedAt = Date.now();
  let attempts = 0;

  while (Date.now() - startedAt <= timeoutMs) {
    attempts += 1;
    const value = await operation();

    if (isReady(value)) {
      return value;
    }

    const remainingMs = timeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, Math.min(intervalMs, remainingMs)));
  }

  throw new PollingTimeoutError(description, timeoutMs, attempts);
}
