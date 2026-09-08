# AI-Assisted Engineering Workflow

This repository is developed with AI assistance, but AI output is not treated as evidence of
correctness.

## Where AI assistance is used

- Drafting implementation alternatives and test ideas
- Producing small code changes from reviewed requirements
- Explaining SDK types and integration boundaries
- Identifying edge cases and documentation gaps
- Assisting with refactoring after deterministic checks pass

## Human verification applied to every change

1. Compare SDK usage with current official Safe documentation and installed type definitions.
2. Review the change for scope, secret handling, and unintended state changes.
3. Run TypeScript, ESLint, Prettier, and deterministic tests.
4. Inspect assertions to confirm that they validate business outcomes, not only HTTP status.
5. Run live tests only with dedicated Sepolia accounts and explicit stateful opt-in.
6. Review reports for leaked credentials before publishing artifacts.

## Evidence hierarchy

From strongest to weakest:

1. Confirmed on-chain receipt and contract state
2. Agreement between independent API and on-chain observations
3. Safe Transaction Service response
4. SDK return value
5. AI-generated explanation

AI output is never accepted as the test oracle.

## Disclosure

The project documents AI assistance because using tools responsibly is part of the demonstrated
skill. Credentials, employer information, and private repositories are never supplied to the AI
workflow.
