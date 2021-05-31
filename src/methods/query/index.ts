import type { Codec } from '@polkadot/types/types';
import type { Balance } from '@polkadot/types/interfaces/runtime';

export interface AccountAmount extends Codec {
  free?: Balance;
}

export let wasm: any;

async function initialize() {
  if (typeof window !== 'undefined') {
    if (typeof process.env.NODE_ENV === "undefined") {
      wasm = await import('hack-hydra-dx-wasm/build/web');
      wasm.default();
    } else { 
      const { import_wasm } = await import('../../utils/import_wasm');
      wasm = await import_wasm();
    }
    
  } else {
    wasm = await import('hack-hydra-dx-wasm/build/nodejs');
  }
}

initialize();

export { getAccountBalances } from './getAccountBalances';
export { getAssetList } from './getAssetList';
export { getPoolInfo } from './getPoolInfo';
export { getSpotPrice } from './getSpotPrice';
export { getTokenAmount } from './getTokenAmount';
export { getPoolAssetsAmounts } from './getPoolAssetAmounts';
export { calculateSpotAmount } from './calculateSpotAmount';
export { getTradePrice } from './getTradePrice';
export { getFreeTokenAmount } from './getFreeTokenAmount';
export { getReservedTokenAmount } from './getReservedTokenAmount';
export { getFrozenFeeTokenAmount } from './getFrozenFeeTokenAmount';
export { getMiscFrozenTokenAmount } from './getMiscFrozenTokenAmount';
export { getMarketcap } from './getMarketcap';
export { getMaxReceivedTradeAmount } from './getMaxReceivedTradeAmount';
export { getMinReceivedTradeAmount } from './getMinReceivedTradeAmount';
