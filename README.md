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