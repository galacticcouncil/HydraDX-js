# HydraDX-js

JS SDK for interacting with HydraDX and Basilisk nodes

## How to use?
1) Import SDK library.
2) Initialize API instance. You can initialize API for 2 chains - `hydraDx` and `basilisk`. So 
you should use `API.initializeHydraDx(...params)` or `API.initializeBasilisk(...params)` accordingly. This
method returns API instance which you can use immediately. 
3) Later in your code you can get API instance by evoking `API.getApi()` what returns previously
initialised API instance.
4) API instance structure has different structure depending on initialization method 
   (`initializeHydraDx` or `initializeBasilisk`):
    ```javascript
      api: {
        hydraDx?: <sdk_methods>,
        basilisk?: <sdk_methods>,
        wasmUtils: <module>.<wasm_utils_methods>
      }  
    ```

---

### Initialization parameters:
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
  
---

## SDK methods
Scope of available methods depends on initialized chain. Some methods are available only for the  
specific chain.


| Method                    | Type  | hydraDx | basilisk | description |
|---------------------------|-------|:-------:|:--------:|-------------|
| getBlockHeightRelayChain  | query |    -    |     +    |             |
| getPoolAssetsWeightsLbp   | query |    -    |     +    |             |
| getSpotPriceLbp           | query |    -    |     +    |             |
| getPoolInfoLbp            | query |    -    |     +    |             |
| getPoolAccountLbp         | query |    -    |     +    |             |
| _getSpotPriceXyk_         | query |    +    |     -    |             |
| _getTradePrice_           | query |    +    |     -    |             |
| _getPoolsInfoXyk_         | query |    +    |     +    |             |
| _getAssetList_            | query |    +    |     +    |             |
| _getPoolInfo_             | query |    +    |          |             |
| _getAccountBalances_      | query |    +    |     +    |             |
| getTokenAmount            | query |    +    |     +    |             |
| _getPoolAssetsAmounts_    | query |    +    |     +    |             |
| getPoolAssetsAmountsLbp   | query |    -    |     +    |             |
| getMaxReceivedTradeAmount | query |    +    |     +    |             |
| getMinReceivedTradeAmount | query |    +    |     +    |             |
| getFreeTokenAmount        | query |    +    |     +    |             |
| getReservedTokenAmount    | query |    +    |     +    |             |
| getFrozenFeeTokenAmount   | query |    +    |     +    |             |
| getMiscFrozenTokenAmount  | query |    +    |     +    |             |
| _createPool_              | tx    |    +    |     +    |             |
| _addLiquidity_            | tx    |    +    |     +    |             |
| _removeLiquidity_         | tx    |    +    |     +    |             |
| _mintAsset_               | tx    |    +    |     +    |             |
| _swap_                    | tx    |    +    |     +    |             |

_*These methods must be reviewed and refactored_

---
### Query

#### getBlockHeightRelayChain(blockHash?: string | null): `BigNumber | null`
- **interface**: `api.<hydraDx|basilisk>.query.getBlockHeightRelayChain`
- **summary**:    Retrieve block height for latest of specific block of relay chain.



#### getPoolInfoLbp({ poolAccount?: string | null; asset0Id?: string; asset1Id?: string; blockHash?: string | Uint8Array; }): Promise<_result | null>
- **result**:
```
{
poolId: string;
saleStart: BigNumber;
saleEnd: BigNumber;
owner: string;
initialWeight: BigNumber;
finalWeight: BigNumber;
asset0Id: string;
asset1Id: string;
weightCurve: string;
feeNumerator: string;
feeDenominator: string;
feeCollector: string;
}
```
- **interface**: `api.basilisk.query.getPoolInfoLbp`
- **summary**:    Retrieve pool details by asset IDs or pool address. Block hash can be provided.

### TX

#### createPoolLbp(_params): `Promise<AddressOrPair | null>`
- **_params**: 
```
{
  poolOwner: AddressOrPair;
  assetA: string;
  assetAAmount: BigNumber; // amount in 1e+1 format which wich will be converted to 1e+12 automatically by SDK
  assetB: string;
  assetBAmount: BigNumber; // amount in 1e+1 format which wich will be converted to 1e+12 automatically by SDK
  initialWeight: BigNumber;
  finalWeight: BigNumber;
  weightCurve: string; // "Linear" only is available for now
  fee: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector: AddressOrPair;
  signer?: Signer;
  isSudo?: boolean; // "false" by default
}
```
- **interface**: `api.basilisk.tx.createPoolLbp`
- **summary**:    Create LBP pool with provided parameters. Can be created from sudo as well (`isSudo: true`). Returns address of newly created pool.


#### updatePoolDataLbp(_params): `Promise<void>`
- **_params**:
```
{
  poolId: AddressOrPair;
  poolOwner?: AddressOrPair;
  start?: BigNumber; // block height in relay chain
  end?: BigNumber; // block height in relay chain
  initialWeight?: BigNumber;
  finalWeight?: BigNumber;
  fee?: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector?: AddressOrPair;
  signer?: Signer;
}
```
- **interface**: `api.basilisk.tx.updatePoolDataLbp`
- **summary**:    Update LBP pool data with provided parameters.



---

## Wasm Utils

API instance contains a bunch of wasm functions for `xyk` and `lbp` modules. 
They are available under `api.wasmUtils.<module>.<functionName>` 
(e.g. `api.wasmUtils.lbp.calculateLinearWeights(...params)`). Each util functions is wrapper for 
original function from [hydra-dx-wasm](https://github.com/galacticcouncil/HydraDX-wasm) library 
and returns raw result of wasm function calculation.

### Available utils:

**XYK module:**
- `getSpotPrice`
- `calculateOutGivenIn`
- `calculateInGivenOut`

**LBP module:**
- `getSpotPrice`
- `calculateOutGivenIn`
- `calculateInGivenOut`
- `calculateLinearWeights`


## Utils

SDK provide a bunch of utils. Some of them you can import directly from SDK package.

Other can be used only with initialized API instance as they need api connection to the chain. 
These chain dependent utils can be found in API instnace - `api.utils.<utilName>`.

- `getFormattedAddress(address: string, format?: number): Promise<string | null>` - Returns formatted address regarding provided ss58Format value. If ss58Format
    is not provided, value will be fetched from initiated in current api instance
    chain (api.registry.getChainProperties())
  

- `setBlocksDelay(delayBlocksNumber: number | BigNumber): Promise<BigNumber | null>` - Set delay for specified number of blocks. As successful result returns 
  blockHeight of latest finalized block, which has been omitted.  With this method you can make chains 
  of actions with delays:
    ```javascript
      const api = Api.getApi();
      
      // some_action_1
      
      await api.utils.setBlocksTimeo(3) // delay for 3 blocks
    
      // some_action_2
    
      const lastBlockHeight = await api.utils.setBlocksDelay(new BigNumber(5)) // delay for 5 blocks
    
      console.log(lastBlockHeight); // -> latest omitted block 
    
      // some_action_3
    ```


## Input/Output data types:

- SDK receives numbers from users only as `BigNumber` (bignumber.js) with decimal part (not BN - bn.js). *Each received
  **amount/balance** number converts for inner usage from format `1e1` to `1e12` (35,4666382916 → 354666382916) (function - `toInternalBN`)*
- SDK makes inner manipulations with numbers as BigNumber in  1e+n format (n == 12 || 18).
- SDN returns numbers to users as `BigNumber` with decimal part. Each result of inner **amount/balance** calculations
  converts to BigNumber with decimal part *(354666382916 → 35,4666382916) (function - `toExternalBN`)*

Reason for using bignumber.js instead of bn.js - bn.js doesn't support decimal part what is not comfortable in
work on front-end side. As SDK is intended to make work with chain data easier, so numbers with explicit decimal part
are more preferred.
