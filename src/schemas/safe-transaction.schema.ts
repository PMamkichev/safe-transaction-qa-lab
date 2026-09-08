import { z } from 'zod';

import { evmAddressSchema } from './safe-info.schema.js';

const hashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'must be a 32-byte transaction hash');

export const safeTransactionEvidenceSchema = z.looseObject({
  safe: evmAddressSchema,
  to: evmAddressSchema,
  value: z.string().regex(/^\d+$/, 'must be an unsigned integer'),
  nonce: z.string().regex(/^\d+$/, 'must be an unsigned integer'),
  safeTxHash: hashSchema,
  transactionHash: hashSchema.nullable(),
  isExecuted: z.boolean(),
  isSuccessful: z.boolean().nullable(),
  confirmationsRequired: z.number().int().positive(),
  confirmations: z
    .array(
      z.looseObject({
        owner: evmAddressSchema,
        signature: z.string().startsWith('0x'),
      }),
    )
    .optional(),
});

export type SafeTransactionEvidence = z.infer<typeof safeTransactionEvidenceSchema>;
