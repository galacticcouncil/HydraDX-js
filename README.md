# HydraDX-js

JS SDK for interacting with HydraDX and Basilisk nodes

## _Package still is under development!_

## How to use?

1. Import SDK library.
2. Initialize API instance. You can initialize API for 2 chains - `hydraDx` and `basilisk`. So
   you should use `API.initializeHydraDx(...params)` or `API.initializeBasilisk(...params)` accordingly. This
   method returns API instance which you can use immediately.
3. Later in your code you can get API instance by evoking `API.getApi()` what returns previously
   initialised API instance.
4. API instance structure has different structure depending on initialization method
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

### Query

#### getBlockHeightRelayChain(`blockHash?: string`): `Promise<BigNumber>`

- **interface**: `api.<hydraDx|basilisk>.query.getBlockHeightRelayChain`
- **summary**: Retrieve block height for latest of specific block of relay chain. You can specify block hash
  of parachain as parameter.

#### getPoolAccountLbp(`assetA: string, assetB: string`): `Promise<BigNumber>`

- **interface**: `api.basilisk.query.getPoolAccountLbp`
- **summary**: Provides LBP pool account address by assets IDs.

#### getPoolAssetsWeightsLbp(`_params`): `Promise<{ assetAWeight: BigNumber; assetBWeight: BigNumber; }>`

- **\_params**:

```
  saleStart: BigNumber,
  saleEnd: BigNumber,
  poolInitialWeight: BigNumber,
  poolFinalWeight: BigNumber,
  relayChainBlockHeight: BigNumber
```

- **interface**: `api.basilisk.query.getPoolAssetsWeightsLbp`
- **summary**: provides weights for assetA and assetB in specific trading period.

#### getSpotPriceLbp(`assetAId: string, assetBId: string, poolAccount?: string, blockHash?: string`): `Promise<BigNumber>`

- **interface**: `api.basilisk.query.getSpotPriceLbp`
- **summary**: provides price for one unit (1000000000000) of asset0 in LBP section.

#### getTokenAmount(`_params`): Promise<BigNumber>

- **\_params**:

```
  accountId: string;
  assetId: string;
  type: string; // free | reserved | feeFrozen | miscFrozen
  blockHash?: string;
```

- **interface**: `api.<hydraDx|basilisk>.query.getTokenAmount`
- **summary**: Provides specific token's balance for specific account.

#### getPoolInfoLbp(`{ poolAccount?: string; assetAId?: string; assetBId?: string; blockHash?: string | Uint8Array; }`): `Promise<_result>`

- **\_result**:

```
{
poolId: string;
saleStart: BigNumber;
saleEnd: BigNumber;
owner: string;
initialWeight: BigNumber;
finalWeight: BigNumber;
assetAId: string;
assetBId: string;
weightCurve: string;
feeNumerator: string;
feeDenominator: string;
feeCollector: string;
}
```

- **interface**: `api.basilisk.query.getPoolInfoLbp`
- **summary**: Retrieve pool details by asset IDs or pool address. Block hash can be provided.

#### getPoolAssetsAmountsLbp(`assetAId: string, assetBId: string, poolAccount: string, blockHash?: string`): `Promise<{assetA: BigNumber; assetB: BigNumber; }>`

- **interface**: `api.basilisk.query.getPoolAssetsAmountsLbp`
- **summary**: Retrieve amounts of specified assets in the pool.

#### getMaxReceivedTradeAmount(`tradeAmount: BigNumber, slippage: BigNumber`): `BigNumber`

- **interface**: `api.<hydraDx|basilisk>.query.getMaxReceivedTradeAmount`
- **summary**: Get maximum received trade amount regarding provided slippage value. `slippage` is a percentage value.

#### getMinReceivedTradeAmount(`tradeAmount: BigNumber, slippage: BigNumber`): `BigNumber`

- **interface**: `api.<hydraDx|basilisk>.query.getMinReceivedTradeAmount`
- **summary**: Get minimum received trade amount regarding provided slippage value. `slippage` is a percentage value.

### TX

#### setBalanceSudo(`_params`): `Promise<void>`

- **\_params**:

```
{
  addressForUpdate: AddressOrPair;
  assetId: string;
  freeBalance: BigNumber;
  reservedBalance: BigNumber;
  signer?: Signer;
}
```

- **interface**: `api.<hydraDx|basilisk>.tx.setBalanceSudo`
- **summary**: Set provided balance for the address with Sudo.

#### createPoolLbp(`_params`): `Promise<AddressOrPair | null>`

- **\_params**:

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
- **summary**: Create new LBP pool with provided parameters. Can be created from sudo as well (`isSudo: true`).
  Returns address of newly created pool or `null` if address is not available in event's response.

#### updatePoolDataLbp(`_params`): `Promise<void>`

- **\_params**:

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
- **summary**: Update LBP pool data with provided parameters.

---

### API calls errors handling

SDK provides opportunity to handle API call errors with variety of custom errors. Each Error instance
has an `error.stack` field that gives you a stack trace showing where the error came from.

If error object from polkadot-api `!!dispatchError.isModule`, so registry error details can be retrieved
via `api.registry.findMetaError`

#### ApiInstanceError

- **interface**:

  - `isOperational: boolean` - is error operational;
  - `call: string` - name of called SDK functions;
  - `name: string` - name of Error;
  - `description: string` - custom Error message;

- **summary**: Occurs when something is wrong with required API instance during API call.

#### ApiBaseError

- **interface**:

  - `isOperational: boolean` - is error operational;
  - `call: string` - name of called SDK functions;
  - `name: string` - name of Error;
  - `description: string` - custom Error message;

- **summary**: Occurs when something is wrong with required API instance during API call.

#### ApiCallError

- **interface**:

  - `isOperational: boolean` - is error operational;
  - `call: string` - name of called SDK functions;
  - `name: string` - name of Error;
  - `description: string` - custom Error message;
  - `dispatchError: Codec` - raw error object from polkadot-api;
  - `registryErrMessage: string` - if `!dispatchError.isModule`, error metadata cannot be retrieved, so `dispatchError` is just converted to string.
  - `registryErrName: string` - if `dispatchError.isModule`, contains registry error name ;
  - `registryErrDoc: string` - if `dispatchError.isModule`, contains registry error documentation ;
  - `registryErrSection: string` - if `dispatchError.isModule`, contains registry error section;

- **summary**: Occurs when `ExtrinsicFailed` in not Sudo calls or `result.isError` in Sudo calls.
  More details [here](https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-get-the-decoded-enum-for-an-extrinsicfailed-event)
  and [here](https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-get-the-result-of-a-sudo-event).

---

## Wasm Utils

API instance contains a bunch of wasm functions for `xyk` and `lbp` modules.
They are available under `api.wasmUtils.<module>.<functionName>`
(e.g. `api.wasmUtils.lbp.calculateLinearWeights(...params)`). Each util functions is a wrapper for
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

#### getFormattedAddress(`address: string, format?: number`): `Promise<string>`

- **interface**: `api.utils.getFormattedAddress`
- **summary**: Returns formatted address regarding provided ss58Format value. If `format` value is provided as parameter,
  so this util function can be imported from SDK library directly and used without initialized API instance.
  If ss58Format is not provided, value will be fetched from initiated in current api instance
  chain (api.registry.getChainProperties()).

#### setBlocksDelay(`delayBlocksNumber: number | BigNumber`): `Promise<BigNumber>`

- **interface**: `api.utils.setBlocksDelay`
- **summary**: Set delay for specified number of blocks. As successful result returns
  blockHeight of latest finalized block, which has been omitted. With this method you can make chains
  of actions with delays:

  ```javascript
  const api = Api.getApi();

  // some_action_1

  await api.utils.setBlocksTimeo(3); // delay for 3 blocks

  // some_action_2

  const lastBlockHeight = await api.utils.setBlocksDelay(new BigNumber(5)); // delay for 5 blocks

  console.log(lastBlockHeight); // -> latest omitted block

  // some_action_3
  ```

## Input/Output data types:

- SDK receives numbers from users only as `BigNumber` (bignumber.js) with decimal part (not BN - bn.js). _Each received
  **amount/balance** number converts for inner usage from format `1e1` to `1e12` (35,4666382916 → 354666382916) (function - `toInternalBN`)_
- SDK makes inner manipulations with numbers as BigNumber in 1e+n format (n == 12 || 18).
- SDN returns numbers to users as `BigNumber` with decimal part. Each result of inner **amount/balance** calculations
  converts to BigNumber with decimal part _(354666382916 → 35,4666382916) (function - `toExternalBN`)_

Reason for using bignumber.js instead of bn.js - bn.js doesn't support decimal part what is not comfortable in
work on front-end side. As SDK is intended to make work with chain data easier, so numbers with explicit decimal part
are more preferred.
