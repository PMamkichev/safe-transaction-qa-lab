import { getAddress, isAddress, type Address } from 'viem';
import { z } from 'zod';

export const evmAddressSchema = z
  .string()
  .refine(isAddress, 'must be a valid EVM address')
  .transform((value) => getAddress(value) as Address);

export const safeInfoSchema = z.object({
  address: evmAddressSchema,
  nonce: z.string().regex(/^\d+$/, 'must be an unsigned integer').transform(BigInt),
  threshold: z.number().int().positive(),
  owners: z.array(evmAddressSchema).min(1),
  singleton: evmAddressSchema,
  modules: z.array(evmAddressSchema),
  fallbackHandler: evmAddressSchema,
  guard: evmAddressSchema,
  version: z.string().min(1),
});

export type SafeInfo = z.infer<typeof safeInfoSchema>;
