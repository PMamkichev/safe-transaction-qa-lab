# Coverage Matrix

| Risk or behaviour                     | Unit | API | On-chain | Stateful E2E | MVP status      |
| ------------------------------------- | :--: | :-: | :------: | :----------: | --------------- |
| Environment is safe and complete      |  ✓   |     |          |              | Automated       |
| Safe address format is valid          |  ✓   |  ✓  |          |              | Automated       |
| Safe exists on Sepolia                |      |     |    ✓     |              | Live validated  |
| Owner set is correct                  |      |  ✓  |    ✓     |              | Live validated  |
| Signature threshold is correct        |      |  ✓  |    ✓     |      ✓       | Live validated  |
| API and contract nonce agree          |      |  ✓  |    ✓     |      ✓       | Live validated  |
| Unknown Safe is rejected              |      |  ✓  |          |              | Live validated  |
| One signature is insufficient         |      |  ✓  |          |      ✓       | Live validated  |
| Second owner confirmation is recorded |      |  ✓  |          |      ✓       | Live validated  |
| Recipient and value remain unchanged  |      |  ✓  |    ✓     |      ✓       | Live validated  |
| Execution receipt is successful       |      |     |    ✓     |      ✓       | Live validated  |
| Indexing delay is handled explicitly  |  ✓   |  ✓  |    ✓     |      ✓       | Live validated  |
| Duplicate or stale state is detected  |  ✓   |  ✓  |    ✓     |      ✓       | Manual for v1.0 |

A check mark identifies an evidence source. `Live validated` means the automated check was
observed against the dedicated Sepolia environment; public hashes are recorded in
[test evidence](test-evidence.md). Manual-only risks remain explicitly labelled.
