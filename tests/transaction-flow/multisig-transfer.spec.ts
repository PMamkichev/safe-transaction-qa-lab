import { OperationType } from '@safe-global/types-kit';
import { expect, test } from '@playwright/test';
import { privateKeyToAccount } from 'viem/accounts';

import { EthereumRpcClient } from '../../src/clients/ethereum-rpc.client.js';
import { SafeApiClient } from '../../src/clients/safe-api.client.js';
import { SafeProtocolClient } from '../../src/clients/safe-protocol.client.js';
import { loadStatefulConfig } from '../../src/config/environment.js';
import { pollUntil } from '../../src/helpers/poll-until.js';

const requiredVariables = [
  'SAFE_API_KEY',
  'SEPOLIA_RPC_URL',
  'SAFE_ADDRESS',
  'OWNER_A_PRIVATE_KEY',
  'OWNER_B_PRIVATE_KEY',
  'RECIPIENT_ADDRESS',
] as const;
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
const statefulTestsEnabled = process.env.STATEFUL_TESTS_ENABLED === 'true';

test.describe('2-of-2 Safe transaction lifecycle', () => {
  test.skip(
    missingVariables.length > 0 || !statefulTestsEnabled,
    missingVariables.length > 0
      ? `Stateful environment is not configured: ${missingVariables.join(', ')}`
      : 'Set STATEFUL_TESTS_ENABLED=true to allow a state-changing test',
  );

  test('proposes, confirms, executes, and reconciles a 1 wei transfer', async ({
    request: _request,
  }, testInfo) => {
    const config = loadStatefulConfig();
    const ownerAAccount = privateKeyToAccount(config.ownerAPrivateKey);
    const ownerBAccount = privateKeyToAccount(config.ownerBPrivateKey);
    const apiClient = new SafeApiClient(config.apiKey);
    const rpcClient = new EthereumRpcClient(config.rpcUrl);
    const ownerAClient = await SafeProtocolClient.connect(
      config.rpcUrl,
      config.safeAddress,
      config.ownerAPrivateKey,
    );
    const ownerBClient = await SafeProtocolClient.connect(
      config.rpcUrl,
      config.safeAddress,
      config.ownerBPrivateKey,
    );

    const initialSafeInfo = await ownerAClient.getInfo();
    const normalizedOwners = initialSafeInfo.owners.map((owner) => owner.toLowerCase());
    expect(initialSafeInfo.threshold, 'MVP requires a 2-of-2 Safe').toBe(2);
    expect(normalizedOwners).toContain(ownerAAccount.address.toLowerCase());
    expect(normalizedOwners).toContain(ownerBAccount.address.toLowerCase());
    expect(await rpcClient.getChainId()).toBe(11_155_111);
    expect(config.recipientAddress.toLowerCase()).not.toBe(config.safeAddress.toLowerCase());
    expect(normalizedOwners).not.toContain(config.recipientAddress.toLowerCase());

    const ownerABalance = await rpcClient.getBalance(ownerAAccount.address);
    expect(ownerABalance, 'Owner A needs Sepolia ETH for execution gas').toBeGreaterThan(0n);
    const safeBalanceBefore = await rpcClient.getBalance(config.safeAddress);
    expect(safeBalanceBefore, 'Safe needs at least 1 wei for the test transfer').toBeGreaterThan(
      0n,
    );
    const recipientBalanceBefore = await rpcClient.getBalance(config.recipientAddress);

    const safeTransaction = await ownerAClient.protocolKit.createTransaction({
      transactions: [
        {
          to: config.recipientAddress,
          value: '1',
          data: '0x',
          operation: OperationType.Call,
        },
      ],
    });
    const safeTxHash = await ownerAClient.protocolKit.getTransactionHash(safeTransaction);
    const ownerASignature = await ownerAClient.protocolKit.signHash(safeTxHash);

    await apiClient.proposeTransaction({
      safeAddress: config.safeAddress,
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress: ownerAAccount.address,
      senderSignature: ownerASignature.data,
      origin: 'safe-transaction-qa-lab',
    });

    const pendingTransaction = await pollUntil({
      operation: () => apiClient.getTransaction(safeTxHash),
      isReady: (transaction) => (transaction.confirmations?.length ?? 0) === 1,
      timeoutMs: 60_000,
      intervalMs: 3_000,
      description: 'Safe Transaction Service to index the proposal',
    });

    expect(pendingTransaction.isExecuted).toBe(false);
    expect(pendingTransaction.confirmationsRequired).toBe(2);
    expect(pendingTransaction.confirmations).toHaveLength(1);
    expect(pendingTransaction.to.toLowerCase()).toBe(config.recipientAddress.toLowerCase());
    expect(pendingTransaction.value).toBe('1');
    expect(BigInt(pendingTransaction.nonce)).toBe(initialSafeInfo.nonce);

    const ownerBSignature = await ownerBClient.protocolKit.signHash(safeTxHash);
    await apiClient.confirmTransaction(safeTxHash, ownerBSignature.data);

    const confirmedTransaction = await pollUntil({
      operation: () => apiClient.getTransaction(safeTxHash),
      isReady: (transaction) => (transaction.confirmations?.length ?? 0) >= 2,
      timeoutMs: 60_000,
      intervalMs: 3_000,
      description: 'Safe Transaction Service to record the second confirmation',
    });

    const execution = await ownerAClient.protocolKit.executeTransaction(confirmedTransaction);
    const receipt = await rpcClient.waitForReceipt(execution.hash as `0x${string}`);

    expect(receipt.status).toBe('success');

    const executedTransaction = await pollUntil({
      operation: () => apiClient.getTransaction(safeTxHash),
      isReady: (transaction) => transaction.isExecuted && transaction.transactionHash !== null,
      timeoutMs: 90_000,
      intervalMs: 3_000,
      description: 'Safe Transaction Service to index the on-chain execution',
    });

    const recipientBalanceAfter = await rpcClient.getBalance(config.recipientAddress);
    expect(recipientBalanceAfter - recipientBalanceBefore).toBe(1n);
    expect(executedTransaction.isSuccessful).toBe(true);
    expect(executedTransaction.transactionHash?.toLowerCase()).toBe(
      receipt.transactionHash.toLowerCase(),
    );
    expect(BigInt(executedTransaction.nonce)).toBe(initialSafeInfo.nonce);

    await testInfo.attach('transaction-evidence.json', {
      contentType: 'application/json',
      body: Buffer.from(
        JSON.stringify(
          {
            network: 'Ethereum Sepolia',
            chainId: 11_155_111,
            safeAddress: config.safeAddress,
            safeTxHash,
            ethereumTransactionHash: receipt.transactionHash,
            recipient: config.recipientAddress,
            valueWei: '1',
            nonce: executedTransaction.nonce,
            confirmations: executedTransaction.confirmations?.length ?? 0,
            executionStatus: receipt.status,
          },
          null,
          2,
        ),
      ),
    });
  });
});
