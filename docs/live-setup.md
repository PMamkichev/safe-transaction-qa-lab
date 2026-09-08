# Live Sepolia Setup

Live tests require public testnet resources but no real-value account or employer credential.

## 1. Generate dedicated accounts

```bash
pnpm setup:accounts
```

The command creates `.env` with file mode `0600`, refuses to overwrite an existing file, and
prints only the public Owner A, Owner B, and recipient addresses.

Never import funds or credentials from a mainnet, personal, or employer-owned wallet.

## 2. Fund Owner A

Use one of the Sepolia faucets listed by
[ethereum.org](https://ethereum.org/developers/docs/networks/#sepolia). Owner A pays Safe
deployment and execution gas. Owner B only provides an off-chain signature in the MVP.

Test ETH is expected to have no real value. Do not buy it or connect a valuable wallet to an
untrusted faucet.

## 3. Predict and deploy the Safe

```bash
pnpm setup:safe:predict
pnpm setup:safe:deploy
```

Prediction is read-only. Deployment verifies the Sepolia chain ID and owner balance before it
broadcasts. After success, copy the printed Safe address into `SAFE_ADDRESS` in `.env`.

## 4. Fund the Safe

Send a small amount of Sepolia ETH to the Safe address. The test transfers only 1 wei, but the
Safe must have a positive balance.

## 5. Add Safe API access

Generate a development API key using the
[official Safe dashboard instructions](https://docs.safe.global/core-api/how-to-use-api-keys).
Paste it into `SAFE_API_KEY` in `.env`. Never paste it into an issue, commit, screenshot, or chat.

## 6. Validate before changing state

```bash
pnpm env:check
pnpm test:read-only
pnpm env:check:stateful
```

The final command intentionally fails while `STATEFUL_TESTS_ENABLED=false`.

## 7. Run the 2-of-2 lifecycle

```bash
STATEFUL_TESTS_ENABLED=true pnpm test:sepolia
```

Review `playwright-report/` and `test-results/` for sanitized evidence before publishing them.
