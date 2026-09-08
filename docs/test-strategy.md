# Test Strategy

## Objective

Provide high-confidence evidence that a two-owner Safe transaction is represented consistently
by the Safe Transaction Service and Ethereum Sepolia throughout its lifecycle.

## System under test

- Safe Smart Account contracts on Ethereum Sepolia (`chainId 11155111`)
- Safe Transaction Service API
- Safe Protocol Kit and API Kit integration
- Ethereum JSON-RPC provider

## Primary quality risks

1. An incorrect owner set or signature threshold is displayed off-chain.
2. A transaction appears executable before enough owners confirm it.
3. Transaction value, recipient, or nonce changes between proposal and execution.
4. The API reports a state that does not match the blockchain receipt or contract state.
5. Indexing delay is misclassified as a functional failure.
6. Secrets or signed material leak into source control or test artifacts.

## Test levels

### Unit

Deterministic tests for configuration parsing, schemas, polling, and reconciliation helpers.

### Read-only API and integration

Queries public Safe and RPC infrastructure without changing blockchain state. These checks are
suitable for regular CI after credentials are configured.

### Stateful Sepolia E2E

Creates and executes a minimal-value Safe transaction. It runs serially, requires explicit
enablement, and is kept separate from the pull-request quality gate.

## Test oracle

Critical fields are compared across at least two sources where possible:

- Safe Transaction Service response
- Safe contract state through Protocol Kit or direct RPC
- Ethereum transaction receipt and event data

An HTTP 2xx response alone is not considered proof of transaction success.

## Reliability approach

- Poll only operations that are expected to be eventually consistent.
- Use a bounded timeout and record the last observed state.
- Do not retry deterministic assertion failures.
- Keep stateful tests serial because transactions share a Safe nonce.
- Report infrastructure unavailability separately from product inconsistencies.

## Entry criteria

- Dedicated Sepolia-only owners exist.
- A `2-of-2` Safe is deployed and funded with a minimal amount of test ETH.
- Safe API and RPC credentials are available through environment variables.

## Exit criteria for v1.0

- The end-to-end multisignature flow passes.
- API and on-chain owner, threshold, nonce, and execution data are reconciled.
- At least eight meaningful automated checks exist.
- Tests and reports contain no secrets.
- A new contributor can run the read-only suite by following the README.

## Explicit exclusions

This project is functional quality engineering, not a smart contract security audit. It does
not make claims about the absence of vulnerabilities in Safe contracts or infrastructure.
