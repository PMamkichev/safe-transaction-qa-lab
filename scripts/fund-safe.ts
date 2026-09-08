import 'dotenv/config';

import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import { loadSafeFundingConfig } from '../src/config/environment.js';

const shouldBroadcast = process.argv.includes('--broadcast');
const fundingAmount = parseEther('0.001');
const config = loadSafeFundingConfig();
const ownerA = privateKeyToAccount(config.ownerAPrivateKey);
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(config.rpcUrl, { retryCount: 0, timeout: 15_000 }),
});
const walletClient = createWalletClient({
  account: ownerA,
  chain: sepolia,
  transport: http(config.rpcUrl, { retryCount: 0, timeout: 15_000 }),
});

const [chainId, ownerBalance, safeCode] = await Promise.all([
  publicClient.getChainId(),
  publicClient.getBalance({ address: ownerA.address }),
  publicClient.getCode({ address: config.safeAddress }),
]);

if (chainId !== sepolia.id) {
  throw new Error(
    `Refusing to continue: expected Sepolia chain ${sepolia.id}, received ${chainId}`,
  );
}

if (safeCode === undefined || safeCode === '0x') {
  throw new Error(
    `Refusing to fund an address without deployed contract code: ${config.safeAddress}`,
  );
}

console.log(`Owner A: ${ownerA.address}`);
console.log(`Safe: ${config.safeAddress}`);
console.log(`Funding amount: ${fundingAmount} wei`);

if (!shouldBroadcast) {
  console.log('Dry run only. Use the explicit broadcast command to fund the Safe.');
  process.exit(0);
}

if (ownerBalance <= fundingAmount) {
  throw new Error('Owner A balance is insufficient for the funding amount and transaction gas');
}

const transactionHash = await walletClient.sendTransaction({
  to: config.safeAddress,
  value: fundingAmount,
});
const receipt = await publicClient.waitForTransactionReceipt({
  hash: transactionHash,
  confirmations: 1,
  timeout: 90_000,
});

if (receipt.status !== 'success') {
  throw new Error(`Safe funding transaction reverted: ${transactionHash}`);
}

const safeBalance = await publicClient.getBalance({ address: config.safeAddress });
console.log(`Funding transaction: ${transactionHash}`);
console.log(`Safe balance: ${safeBalance} wei`);
