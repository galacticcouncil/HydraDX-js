import type { Codec } from '@polkadot/types/types';
import type { Balance } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';

import { toInternalBN, toExternalBN } from '../../utils';
import { AssetBalance } from '../../types';

export interface AccountAmount extends Codec {
  free?: Balance;
}

export let wasm: any;

async function initialize() {
  if (typeof window !== 'undefined') {
    if (typeof process.env.NODE_ENV === 'undefined') {
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

// import { getAccountBalances } from './getAccountBalances';
import { getAssetList } from './getAssetList';
import { getPoolInfo } from './getPoolInfo';
// import { getSpotPrice } from './getSpotPrice';
import { getTokenAmount } from './getTokenAmount';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { calculateSpotAmount as _calculateSpotAmount } from './calculateSpotAmount';
import { getTradePrice as _getTradePrice } from './getTradePrice';
import { getFreeTokenAmount } from './getFreeTokenAmount';
import { getReservedTokenAmount } from './getReservedTokenAmount';
import { getFrozenFeeTokenAmount } from './getFrozenFeeTokenAmount';
import { getMiscFrozenTokenAmount } from './getMiscFrozenTokenAmount';
import { getMarketcap } from './getMarketcap';
import { getMaxReceivedTradeAmount as _getMaxReceivedTradeAmount } from './getMaxReceivedTradeAmount';
import { getMinReceivedTradeAmount as _getMinReceivedTradeAmount } from './getMinReceivedTradeAmount';

import { getAccountBalances as _getAccountBalances } from './getAccountBalances';
import { getSpotPrice as _getSpotPrice } from './getSpotPrice';

const calculateSpotAmount = async (
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber
) => {
  return Promise.resolve(
    toExternalBN(
      await _calculateSpotAmount(asset1Id, asset2Id, toInternalBN(amount))
    )
  );
};

const getTradePrice = async (
  asset1Id: string,
  asset2Id: string,
  tradeAmount: BigNumber,
  actionType: string
) => {
  return Promise.resolve(
    toExternalBN(
      await _getTradePrice(
        asset1Id,
        asset2Id,
        toInternalBN(tradeAmount),
        actionType
      )
    )
  );
};

const getSpotPrice = async (asset1Id: string, asset2Id: string) => {
  return Promise.resolve(toExternalBN(await _getSpotPrice(asset1Id, asset2Id)));
};

const getMaxReceivedTradeAmount = (
  tradeAmount: BigNumber,
  slippage: BigNumber
) => {
  return toExternalBN(
    _getMaxReceivedTradeAmount(
      toInternalBN(tradeAmount),
      toInternalBN(slippage)
    )
  );
};

const getMinReceivedTradeAmount = (
  tradeAmount: BigNumber,
  slippage: BigNumber
) => {
  return toExternalBN(
    _getMinReceivedTradeAmount(
      toInternalBN(tradeAmount),
      toInternalBN(slippage)
    )
  );
};

const getAccountBalances = (account: any) => {
  return Promise.resolve(async () => {
    const balances: AssetBalance[] = await _getAccountBalances(account);
    return balances.map(({ assetId, balance, balanceFormatted }) => {
      return {
        assetId,
        balance: toExternalBN(balance),
        balanceFormatted: toExternalBN(
          new BigNumber(balanceFormatted)
        ).toString(),
      };
    });
  });
};

export {
  getAccountBalances,
  getAssetList,
  getPoolInfo,
  getSpotPrice,
  getTokenAmount,
  getPoolAssetsAmounts,
  calculateSpotAmount,
  getTradePrice,
  getFreeTokenAmount,
  getReservedTokenAmount,
  getFrozenFeeTokenAmount,
  getMiscFrozenTokenAmount,
  getMarketcap,
  getMaxReceivedTradeAmount,
  getMinReceivedTradeAmount,
};
