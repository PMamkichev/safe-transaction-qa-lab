import SafeApiKit, {
  type ProposeTransactionProps,
  type SafeServiceInfoResponse,
  type SignatureResponse,
} from '@safe-global/api-kit';
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit';
import type { Address } from 'viem';

import { safeInfoSchema, type SafeInfo } from '../schemas/safe-info.schema.js';
import { safeTransactionEvidenceSchema } from '../schemas/safe-transaction.schema.js';

const SEPOLIA_CHAIN_ID = 11_155_111n;

export class SafeApiClient {
  readonly #apiKit: SafeApiKit;

  constructor(apiKey: string) {
    this.#apiKit = new SafeApiKit({
      chainId: SEPOLIA_CHAIN_ID,
      apiKey,
    });
  }

  async getServiceInfo(): Promise<SafeServiceInfoResponse> {
    return this.#apiKit.getServiceInfo();
  }

  async getSafeInfo(safeAddress: Address): Promise<SafeInfo> {
    const response = await this.#apiKit.getSafeInfo(safeAddress);
    return safeInfoSchema.parse(response);
  }

  async getTransaction(safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const response = await this.#apiKit.getTransaction(safeTxHash);
    safeTransactionEvidenceSchema.parse(response);
    return response;
  }

  async proposeTransaction(properties: ProposeTransactionProps): Promise<void> {
    await this.#apiKit.proposeTransaction(properties);
  }

  async confirmTransaction(safeTxHash: string, signature: string): Promise<SignatureResponse> {
    return this.#apiKit.confirmTransaction(safeTxHash, signature);
  }
}
