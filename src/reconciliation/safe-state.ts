import type { Address } from 'viem';

import type { OnChainSafeInfo } from '../clients/safe-protocol.client.js';
import type { SafeInfo } from '../schemas/safe-info.schema.js';

export type ReconciliationResult = {
  matches: boolean;
  differences: string[];
};

function normalizeAddresses(addresses: Address[]): string[] {
  return addresses.map((address) => address.toLowerCase()).sort();
}

function normalizeContractVersion(version: string): string {
  const metadataSeparator = version.indexOf('+');
  return metadataSeparator === -1 ? version : version.slice(0, metadataSeparator);
}

export function reconcileSafeState(
  apiInfo: SafeInfo,
  onChainInfo: OnChainSafeInfo,
): ReconciliationResult {
  const differences: string[] = [];

  if (apiInfo.address.toLowerCase() !== onChainInfo.address.toLowerCase()) {
    differences.push(`address: API=${apiInfo.address}, on-chain=${onChainInfo.address}`);
  }

  if (apiInfo.nonce !== onChainInfo.nonce) {
    differences.push(`nonce: API=${apiInfo.nonce}, on-chain=${onChainInfo.nonce}`);
  }

  if (apiInfo.threshold !== onChainInfo.threshold) {
    differences.push(`threshold: API=${apiInfo.threshold}, on-chain=${onChainInfo.threshold}`);
  }

  const apiOwners = normalizeAddresses(apiInfo.owners);
  const onChainOwners = normalizeAddresses(onChainInfo.owners);

  if (JSON.stringify(apiOwners) !== JSON.stringify(onChainOwners)) {
    differences.push(`owners: API=${apiOwners.join(',')}, on-chain=${onChainOwners.join(',')}`);
  }

  if (normalizeContractVersion(apiInfo.version) !== normalizeContractVersion(onChainInfo.version)) {
    differences.push(`version: API=${apiInfo.version}, on-chain=${onChainInfo.version}`);
  }

  return {
    matches: differences.length === 0,
    differences,
  };
}
