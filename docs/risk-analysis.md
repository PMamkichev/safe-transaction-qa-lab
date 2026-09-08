# Risk Analysis

| Risk                                                   | Impact   | Likelihood | Mitigation in this project                                                |
| ------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------- |
| Transaction executes with insufficient authorization   | Critical | Low        | Verify threshold and distinct owner confirmations before execution        |
| API state diverges from contract state                 | High     | Medium     | Reconcile independent API and on-chain observations                       |
| Wrong recipient, value, or nonce is executed           | Critical | Low        | Assert immutable transaction fields before and after execution            |
| Public RPC is unavailable or on the wrong chain        | High     | Medium     | Validate chain ID, use bounded timeouts, classify infrastructure failures |
| Transaction Service indexing is delayed                | Medium   | High       | Use bounded polling and retain the last known state                       |
| Shared Safe nonce creates flaky parallel tests         | High     | High       | Run stateful tests serially and lock CI concurrency                       |
| Test account lacks gas or Safe lacks funds             | Medium   | Medium     | Check balances before proposal and execution                              |
| Secret reaches Git history or test artifacts           | Critical | Low        | Ignore `.env`, use GitHub Secrets, sanitize diagnostics, review artifacts |
| External API contract changes                          | Medium   | Medium     | Runtime schemas fail with field-level diagnostics                         |
| A testnet observation is presented as a security audit | High     | Low        | State the functional QA scope and exclusions prominently                  |

## Prioritization rule

Automation priority is based on financial impact, repeatability, and diagnostic value. A large
number of shallow UI tests would not compensate for missing transaction authorization and
reconciliation checks.
