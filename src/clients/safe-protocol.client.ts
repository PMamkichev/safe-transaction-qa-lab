import Safe from '@safe-global/protocol-kit';
import { getAddress, type Address, type Hex } from 'viem';

export type OnChainSafeInfo = {
  address: Address;
  nonce: bigint;
  threshold: number;
  owners: Address[];
  version: string;
};

export class SafeProtocolClient {
  readonly #protocolKit: Safe;
  readonly #safeAddress: Address;

  private constructor(protocolKit: Safe, safeAddress: Address) {
    this.#protocolKit = protocolKit;
    this.#safeAddress = safeAddress;
  }

  static async connect(
    rpcUrl: string,
    safeAddress: Address,
    signer?: Hex,
  ): Promise<SafeProtocolClient> {
    const protocolKit = await Safe.init({
      provider: rpcUrl,
      safeAddress,
      ...(signer === undefined ? {} : { signer }),
    });

    return new SafeProtocolClient(protocolKit, safeAddress);
  }

  async isDeployed(): Promise<boolean> {
    return this.#protocolKit.isSafeDeployed();
  }

  async getInfo(): Promise<OnChainSafeInfo> {
    const [owners, threshold, nonce] = await Promise.all([
      this.#protocolKit.getOwners(),
      this.#protocolKit.getThreshold(),
      this.#protocolKit.getNonce(),
    ]);

    return {
      address: this.#safeAddress,
      owners: owners.map((owner) => getAddress(owner)),
      threshold,
      nonce: BigInt(nonce),
      version: this.#protocolKit.getContractVersion(),
    };
  }

  get protocolKit(): Safe {
    return this.#protocolKit;
  }
}
