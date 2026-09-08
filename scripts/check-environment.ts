import 'dotenv/config';

import { loadReadOnlyConfig, loadStatefulConfig } from '../src/config/environment.js';

const mode = process.argv.includes('--stateful') ? 'stateful' : 'read-only';
const config = mode === 'stateful' ? loadStatefulConfig() : loadReadOnlyConfig();

console.log(
  JSON.stringify(
    {
      mode,
      safeAddress: config.safeAddress,
      rpcOrigin: new URL(config.rpcUrl).origin,
      credentialsPresent: true,
    },
    null,
    2,
  ),
);
