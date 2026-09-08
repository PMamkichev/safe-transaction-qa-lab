import { getAddress, isAddress, type Address, type Hex } from 'viem';
import { z } from 'zod';

const addressSchema = z
  .string()
  .refine(isAddress, 'must be a valid EVM address')
  .transform((value) => getAddress(value) as Address);

const privateKeySchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, 'must be a 32-byte 0x-prefixed private key')
  .transform((value) => value as Hex);

const readOnlyEnvironmentSchema = z.object({
  SAFE_API_KEY: z.string().trim().min(1, 'is required'),
  SEPOLIA_RPC_URL: z.url('must be a valid URL'),
  SAFE_ADDRESS: addressSchema,
});

const statefulEnvironmentSchema = readOnlyEnvironmentSchema.extend({
  STATEFUL_TESTS_ENABLED: z.literal('true', {
    error: 'must be explicitly set to true before a state-changing test can run',
  }),
  OWNER_A_PRIVATE_KEY: privateKeySchema,
  OWNER_B_PRIVATE_KEY: privateKeySchema,
  RECIPIENT_ADDRESS: addressSchema,
});

const setupEnvironmentSchema = z.object({
  SEPOLIA_RPC_URL: z.url('must be a valid URL'),
  OWNER_A_PRIVATE_KEY: privateKeySchema,
  OWNER_B_PRIVATE_KEY: privateKeySchema,
});

export type ReadOnlyConfig = {
  apiKey: string;
  rpcUrl: string;
  safeAddress: Address;
};

export type StatefulConfig = ReadOnlyConfig & {
  ownerAPrivateKey: Hex;
  ownerBPrivateKey: Hex;
  recipientAddress: Address;
};

export type SetupConfig = {
  rpcUrl: string;
  ownerAPrivateKey: Hex;
  ownerBPrivateKey: Hex;
};

export class ConfigurationError extends Error {
  constructor(mode: 'read-only' | 'stateful' | 'setup', issues: z.core.$ZodIssue[]) {
    const details = issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    super(`Invalid ${mode} test configuration: ${details}`);
    this.name = 'ConfigurationError';
  }
}

function parseEnvironment<T>(
  mode: 'read-only' | 'stateful' | 'setup',
  schema: z.ZodType<T>,
  environment: NodeJS.ProcessEnv,
): T {
  const result = schema.safeParse(environment);

  if (!result.success) {
    throw new ConfigurationError(mode, result.error.issues);
  }

  return result.data;
}

export function loadReadOnlyConfig(environment: NodeJS.ProcessEnv = process.env): ReadOnlyConfig {
  const parsed = parseEnvironment('read-only', readOnlyEnvironmentSchema, environment);

  return {
    apiKey: parsed.SAFE_API_KEY,
    rpcUrl: parsed.SEPOLIA_RPC_URL,
    safeAddress: parsed.SAFE_ADDRESS,
  };
}

export function loadStatefulConfig(environment: NodeJS.ProcessEnv = process.env): StatefulConfig {
  const parsed = parseEnvironment('stateful', statefulEnvironmentSchema, environment);

  return {
    apiKey: parsed.SAFE_API_KEY,
    rpcUrl: parsed.SEPOLIA_RPC_URL,
    safeAddress: parsed.SAFE_ADDRESS,
    ownerAPrivateKey: parsed.OWNER_A_PRIVATE_KEY,
    ownerBPrivateKey: parsed.OWNER_B_PRIVATE_KEY,
    recipientAddress: parsed.RECIPIENT_ADDRESS,
  };
}

export function loadSetupConfig(environment: NodeJS.ProcessEnv = process.env): SetupConfig {
  const parsed = parseEnvironment('setup', setupEnvironmentSchema, environment);

  return {
    rpcUrl: parsed.SEPOLIA_RPC_URL,
    ownerAPrivateKey: parsed.OWNER_A_PRIVATE_KEY,
    ownerBPrivateKey: parsed.OWNER_B_PRIVATE_KEY,
  };
}
