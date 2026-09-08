import { createPublicClient, http, type Address, type Hash, type TransactionReceipt } from 'viem';
import { sepolia } from 'viem/chains';

export class EthereumRpcClient {
  readonly #client;

  constructor(rpcUrl: string) {
    this.#client = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, {
        retryCount: 0,
        timeout: 15_000,
      }),
    });
  }

  async getChainId(): Promise<number> {
    return this.#client.getChainId();
  }

  async getBalance(address: Address): Promise<bigint> {
    return this.#client.getBalance({ address });
  }

  async waitForReceipt(hash: Hash): Promise<TransactionReceipt> {
    return this.#client.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 90_000,
    });
  }
}
