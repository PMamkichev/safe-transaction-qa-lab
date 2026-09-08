import 'dotenv/config';

import Safe from '@safe-global/protocol-kit';
import { createPublicClient, createWalletClient, getAddress, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import { loadSetupConfig } from '../src/config/environment.js';

const shouldBroadcast = process.argv.includes('--broadcast');
const config = loadSetupConfig();
const ownerA = privateKeyToAccount(config.ownerAPrivateKey);
const ownerB = privateKeyToAccount(config.ownerBPrivateKey);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(config.rpcUrl, { retryCount: 0, timeout: 15_000 }),
});
const walletClient = createWalletClient({
  account: ownerA,
  chain: sepolia,
  transport: http(config.rpcUrl, { retryCount: 0, timeout: 15_000 }),
});

const chainId = await publicClient.getChainId();
if (chainId !== sepolia.id) {
  throw new Error(
    `Refusing to continue: expected Sepolia chain ${sepolia.id}, received ${chainId}`,
  );
}

const protocolKit = await Safe.init({
  provider: config.rpcUrl,
  signer: config.ownerAPrivateKey,
  predictedSafe: {
    safeAccountConfig: {
      owners: [ownerA.address, ownerB.address],
      threshold: 2,
    },
  },
});

const predictedSafeAddress = getAddress(await protocolKit.getAddress());
const ownerABalance = await publicClient.getBalance({ address: ownerA.address });

console.log(`Network: Ethereum Sepolia (${chainId})`);
console.log(`Owner A: ${ownerA.address}`);
console.log(`Owner B: ${ownerB.address}`);
console.log(`Predicted 2-of-2 Safe: ${predictedSafeAddress}`);
console.log(`Owner A balance: ${ownerABalance} wei`);

if (!shouldBroadcast) {
  console.log('Prediction only. Run pnpm setup:safe:deploy to broadcast the deployment.');
  process.exit(0);
}

if (ownerABalance === 0n) {
  throw new Error('Owner A needs Sepolia ETH for deployment gas');
}

if (await protocolKit.isSafeDeployed()) {
  console.log('The predicted Safe is already deployed; no transaction was sent.');
  process.exit(0);
}

const deployment = await protocolKit.createSafeDeploymentTransaction();
const transactionHash = await walletClient.sendTransaction({
  to: getAddress(deployment.to),
  value: BigInt(deployment.value),
  data: deployment.data as Hex,
});
const receipt = await publicClient.waitForTransactionReceipt({
  hash: transactionHash,
  confirmations: 1,
  timeout: 90_000,
});

if (receipt.status !== 'success') {
  throw new Error(`Safe deployment reverted: ${transactionHash}`);
}

console.log(`Safe deployed: ${predictedSafeAddress}`);
console.log(`Deployment transaction: ${transactionHash}`);
console.log(
  'Copy the Safe address into SAFE_ADDRESS in .env and fund the Safe with at least 1 wei.',
);
