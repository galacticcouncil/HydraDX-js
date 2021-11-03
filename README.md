# HydraDX-js

JS SDK for interacting with HydraDX nodes


## input/Output data types:

- SDK receives numbers from users only as `BigNumber` (bignumber.js) with decimal part (not BN - bn.js). *Each received 
  number converts for inner usage (35,4666382916 → 354666382916) (function - `toInternalBN`)*
- SDK makes inner manipulations with numbers as BigNumber in  1e+n format (n == 12 || 18).
- SDN returns numbers to users as `BigNumber` with decimal part. Each result of inner calculations or API response 
  converts to BigNumber with decimal part *(354666382916 → 35,4666382916) (function - `toExternalBN`)*

Reason for using bignumber.js instead of bn.js - bn.js doesn't support decimal part what is not comfortable in
work on front-end side. As SDK is intended to make work with chain data easier, so numbers with explicit decimal part
are more preferred.


##How to use?
1) Import SDK library.
2) Initialize API instance. You can initialize API for 2 chains - `hydraDx` and `basilisk`. So 
you should use `API.initializeHydraDx(...params)` or `API.initializeBasilisk(...params)` accordingly. This
method returns API instance which you can use immediately. 
3) Later in your code you can get API instance by evoking `API.getApi()` what returns previously
initialised API instance.

###Initialization parameters:
`initialize<HydraDx|Basilisk>(apiListeners, apiUrl, typesConfig, maxRetries)`

- `apiListeners` listeners for in-chain events. Can be empty object.
- `apiUrl` - URL for WS connection to the chain. By default, it's `ws://127.0.0.1:9944`
- `typesConfig` - types configuration for the connected chain. By default, SDK uses types configs 
  for initialized chain. (Default types can be found for investigation here `./src/config/`)
  ```javascript
  {
    types: RegistryTypes;
    alias: Record<string, OverrideModuleType>;
  }
  ```
- `maxRetries` - number of connection attempts to the specified chain during initialization
  or after loosing connection.
  

## Wasm Utils

API instance contains a bunch of wasm functions for `xyk` and `lbp` modules. 
They are available under `api.wasmUtils.<module>.<functionName>`. Each util functions is wrapper for 
original function from [hydra-dx-wasm](https://github.com/galacticcouncil/HydraDX-wasm) library 
and returns raw result of wasm function calculation.

###Available utils:

XYK module:
- getSpotPrice
- calculateOutGivenIn
- calculateInGivenOut

LBP module:
- getSpotPrice
- calculateOutGivenIn
- calculateInGivenOut
- calculateLinearWeights