import { writeFile } from 'node:fs/promises';

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const ownerAPrivateKey = generatePrivateKey();
const ownerBPrivateKey = generatePrivateKey();
const ownerAAddress = privateKeyToAccount(ownerAPrivateKey).address;
const ownerBAddress = privateKeyToAccount(ownerBPrivateKey).address;
const recipientAddress = privateKeyToAccount(generatePrivateKey()).address;
const environmentFile = new URL('../.env', import.meta.url);

const contents = `# Generated dedicated Ethereum Sepolia test environment.
# Never use these accounts on mainnet and never commit this file.
SAFE_API_KEY=
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SAFE_ADDRESS=
OWNER_A_PRIVATE_KEY=${ownerAPrivateKey}
OWNER_B_PRIVATE_KEY=${ownerBPrivateKey}
RECIPIENT_ADDRESS=${recipientAddress}
STATEFUL_TESTS_ENABLED=false
`;

try {
  await writeFile(environmentFile, contents, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
    throw new Error('Refusing to overwrite the existing .env file', { cause: error });
  }

  throw error;
}

console.log('Created a test-only .env file with owner keys hidden from console output.');
console.log(`Owner A address: ${ownerAAddress}`);
console.log(`Owner B address: ${ownerBAddress}`);
console.log(`Recipient address: ${recipientAddress}`);
console.log('Next: fund Owner A with Sepolia ETH, then run pnpm setup:safe:predict.');
