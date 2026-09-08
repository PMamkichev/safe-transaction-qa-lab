# Live Test Evidence

This page records a sanitized successful validation of the MVP against Ethereum Sepolia. It
contains only public testnet identifiers; API keys and owner private keys remain local.

## Run summary

- **Date:** 2026-09-08
- **Network:** Ethereum Sepolia (`chainId 11155111`)
- **Safe:** [`0x47EC2Ccd990F5f6fA99eae1F13A8D090De5Ee9BD`](https://sepolia.etherscan.io/address/0x47EC2Ccd990F5f6fA99eae1F13A8D090De5Ee9BD)
- **Configuration:** two owners, threshold `2-of-2`
- **Deterministic suite:** 19 passed
- **Read-only live suite:** 4 passed
- **Stateful lifecycle:** 1 passed

## Transaction lifecycle evidence

The stateful test proposed a 1 wei transfer, verified that one signature was insufficient,
recorded the second owner confirmation, executed the transaction, and reconciled the receipt,
recipient balance, Safe nonce, and Transaction Service state.

| Evidence              | Public identifier                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safe transaction hash | `0xbd3fb52b1ac57cacf9deb1d06ec6fed9584099b0bb41a8ba13ae35e107035f58`                                                                                                       |
| Ethereum execution    | [`0x30ec847dbd6fe044470ea0313b96af6dafb3fe419de782c4966e148676516dc6`](https://sepolia.etherscan.io/tx/0x30ec847dbd6fe044470ea0313b96af6dafb3fe419de782c4966e148676516dc6) |
| Recipient             | [`0xe7bef488eAFcEEC82F685323bE15b2BC8d12e623`](https://sepolia.etherscan.io/address/0xe7bef488eAFcEEC82F685323bE15b2BC8d12e623)                                            |
| Value                 | `1 wei`                                                                                                                                                                    |
| Safe nonce            | `0`                                                                                                                                                                        |
| Confirmations         | `2`                                                                                                                                                                        |
| Execution status      | `success`                                                                                                                                                                  |

## Environment bootstrap evidence

| Action                           | Ethereum Sepolia transaction                                                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy dedicated Safe            | [`0xe98bd398da132f002f8a73ae5aad4dd1a9436a80ab12c05a3fb22ee0acd638e0`](https://sepolia.etherscan.io/tx/0xe98bd398da132f002f8a73ae5aad4dd1a9436a80ab12c05a3fb22ee0acd638e0) |
| Fund Safe with 0.001 Sepolia ETH | [`0x1536f15aaffbc9e81aaa7023e30204c4e0f3410d37b66ba25e16212e263ca86a`](https://sepolia.etherscan.io/tx/0x1536f15aaffbc9e81aaa7023e30204c4e0f3410d37b66ba25e16212e263ca86a) |

The reproducible assertions live in
[`tests/transaction-flow/multisig-transfer.spec.ts`](../tests/transaction-flow/multisig-transfer.spec.ts).
