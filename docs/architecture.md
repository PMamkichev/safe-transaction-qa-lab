# Architecture

```mermaid
flowchart LR
    T[Playwright test suite]
    A[Safe API client]
    P[Safe Protocol Kit]
    R[Ethereum RPC client]
    S[Safe Transaction Service]
    C[Safe contract on Sepolia]

    T --> A --> S
    T --> P --> C
    T --> R --> C
    S -. indexes .-> C
    T -->|reconcile observations| T
```

## Design principles

- Separate transport clients from business assertions.
- Parse untrusted configuration and critical API responses at runtime.
- Compare independent observations instead of trusting one API response.
- Keep read-only and state-changing tests in different Playwright projects.
- Keep secrets outside the repository and disable stateful actions by default.
