# Manual Test Cases

These cases define the wider risk coverage. The automated MVP intentionally implements only
the highest-value stable subset.

## TC-01 — Read Safe configuration

**Priority:** Critical  
**Preconditions:** A deployed Safe exists on Ethereum Sepolia.

1. Request the Safe through Transaction Service.
2. Read the same Safe through Protocol Kit.
3. Compare address, owners, threshold, nonce, and version.

**Expected:** Both sources describe the same Safe state.

## TC-02 — Propose a valid 2-of-2 transaction

**Priority:** Critical

1. Create a 1 wei transfer using the current Safe nonce.
2. Calculate the Safe transaction hash.
3. Sign it with owner A.
4. Submit it to Transaction Service.

**Expected:** The transaction is indexed as pending with one valid confirmation.

## TC-03 — Prevent execution with one confirmation

**Priority:** Critical

1. Retrieve the transaction from TC-02.
2. Inspect the required and collected confirmations.

**Expected:** Two confirmations are required, only one is present, and the transaction remains
unexecuted.

## TC-04 — Confirm with the second owner

**Priority:** Critical

1. Sign the same Safe transaction hash with owner B.
2. Submit the confirmation.
3. Retrieve the transaction again.

**Expected:** Both distinct owner confirmations are present and the transaction data is
unchanged.

## TC-05 — Execute and reconcile the transaction

**Priority:** Critical

1. Execute the fully confirmed transaction.
2. Wait for an Ethereum receipt.
3. Wait for Transaction Service to index the execution.
4. Compare transaction hashes, recipient, value, nonce, and success state.

**Expected:** The receipt succeeds, the recipient receives 1 wei, and API and blockchain data
agree.

## TC-06 — Unknown Safe address

**Priority:** High

Request a valid but undeployed Safe address.

**Expected:** Transaction Service returns a typed not-found response and no Safe data.

## TC-07 — Malformed Safe address

**Priority:** Medium

Request an address with an invalid length or non-hexadecimal characters.

**Expected:** The client or service rejects it as invalid; no ambiguous server error is returned.

## TC-08 — Confirmation by a non-owner

**Priority:** Critical

Sign a pending transaction hash with an account that is not a Safe owner.

**Expected:** The confirmation is rejected and the number of valid confirmations does not change.

## TC-09 — Duplicate owner confirmation

**Priority:** High

Submit owner A's confirmation twice.

**Expected:** A duplicate is rejected or treated idempotently; it never counts as a second owner.

## TC-10 — Stale nonce

**Priority:** Critical

Attempt to propose or execute a transaction using an already executed nonce.

**Expected:** It cannot replace or replay the completed transaction unexpectedly.

## TC-11 — Insufficient Safe balance

**Priority:** High

Create a transfer whose value exceeds the Safe balance.

**Expected:** Execution fails without an incorrect successful status in Transaction Service.

## TC-12 — Indexing delay

**Priority:** High

Observe a valid proposal or execution before Transaction Service has indexed it.

**Expected:** The test waits for a bounded period, records the last known state, and reports an
indexing timeout separately from a contract failure.

## TC-13 — RPC points to the wrong network

**Priority:** Critical

Configure an RPC endpoint whose chain ID is not `11155111`.

**Expected:** Preflight validation stops the state-changing scenario before signing or sending.

## TC-14 — RPC timeout during receipt polling

**Priority:** High

Interrupt RPC access after transaction submission.

**Expected:** The run fails with infrastructure diagnostics and retains the transaction hashes
needed for manual investigation.

## TC-15 — Secrets in logs and reports

**Priority:** Critical

Inspect console output, JSON results, traces, and HTML reports after success and failure.

**Expected:** No private key, API key, seed phrase, or complete signed payload is present.
