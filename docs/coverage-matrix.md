# Coverage Matrix

| Risk or behaviour                     | Unit | API | On-chain | Stateful E2E | MVP status                      |
| ------------------------------------- | :--: | :-: | :------: | :----------: | ------------------------------- |
| Environment is safe and complete      |  ✓   |     |          |              | Automated                       |
| Safe address format is valid          |  ✓   |  ✓  |          |              | Automated                       |
| Safe exists on Sepolia                |      |     |    ✓     |              | Coded; live validation required |
| Owner set is correct                  |      |  ✓  |    ✓     |              | Coded; live validation required |
| Signature threshold is correct        |      |  ✓  |    ✓     |      ✓       | Coded; live validation required |
| API and contract nonce agree          |      |  ✓  |    ✓     |      ✓       | Coded; live validation required |
| Unknown Safe is rejected              |      |  ✓  |          |              | Coded; live validation required |
| One signature is insufficient         |      |  ✓  |          |      ✓       | Coded; live validation required |
| Second owner confirmation is recorded |      |  ✓  |          |      ✓       | Coded; live validation required |
| Recipient and value remain unchanged  |      |  ✓  |    ✓     |      ✓       | Coded; live validation required |
| Execution receipt is successful       |      |     |    ✓     |      ✓       | Coded; live validation required |
| Indexing delay is handled explicitly  |  ✓   |  ✓  |    ✓     |      ✓       | Automated                       |
| Duplicate or stale state is detected  |  ✓   |  ✓  |    ✓     |      ✓       | Manual for v1.0                 |

A check mark identifies an evidence source. Live validation remains distinct from implementation
so the portfolio does not claim results that have not been observed.
