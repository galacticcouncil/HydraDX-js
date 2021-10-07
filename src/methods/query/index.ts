import type { Codec } from '@polkadot/types/types';
import type { Balance } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';

import { toInternalBN, toExternalBN } from '../../utils';
import { AssetBalance } from '../../types';

export interface AccountAmount extends Codec {
  free?: Balance;
}

export let wasm: { xyk: any; lbp: any } = { xyk: null, lbp: null };

async function initializeWasm() {
  if (typeof window !== 'undefined') {
    if (typeof process.env.NODE_ENV === 'undefined') {
      wasm.xyk = await import('hydra-dx-wasm/build/xyk/web');
      wasm.xyk.default();
      wasm.lbp = await import('hydra-dx-wasm/build/lbp/web');
      wasm.lbp.default();
    } else {
      const { import_wasm } = await import('../../utils/import_wasm');
      wasm.xyk = await import_wasm.xyk();
      wasm.lbp = await import_wasm.lbp();
    }
  } else {
    wasm.xyk = await import('hydra-dx-wasm/build/xyk/nodejs');
    wasm.lbp = await import('hydra-dx-wasm/build/lbp/nodejs');
  }
}

initializeWasm();

// import { getAccountBalances } from './getAccountBalances';
import { getAssetList } from './getAssetList';
import { getPoolInfo as _getPoolInfo } from './getPoolInfo';
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
  return new Promise((resolve, reject) => {
    _getAccountBalances(account)
      .then((balances: AssetBalance[]) => {
        resolve(
          balances.map(
            ({
              assetId,
              balance,
              totalBalance,
              freeBalance,
              feeFrozenBalance,
              miscFrozenBalance,
              reservedBalance,
            }) => {
              return {
                assetId,
                balance: toExternalBN(balance),
                totalBalance: toExternalBN(new BigNumber(totalBalance)),
                freeBalance: toExternalBN(new BigNumber(freeBalance)),
                feeFrozenBalance: toExternalBN(new BigNumber(feeFrozenBalance)),
                miscFrozenBalance: toExternalBN(
                  new BigNumber(miscFrozenBalance)
                ),
                reservedBalance: toExternalBN(new BigNumber(reservedBalance)),
              };
            }
          )
        );
      })
      .catch(e => reject(e));
  });
};

const getPoolInfo = () => {
  return new Promise((resolve, reject) => {
    _getPoolInfo()
      .then((res: any) => {
        Object.keys(res.poolInfo).forEach(key => {
          if (res.poolInfo[key].poolAssetsAmount) {
            res.poolInfo[key].poolAssetsAmount.asset1 = toExternalBN(
              res.poolInfo[key].poolAssetsAmount.asset1
            );
            res.poolInfo[key].poolAssetsAmount.asset2 = toExternalBN(
              res.poolInfo[key].poolAssetsAmount.asset2
            );
          }
          res.poolInfo[key].marketCap = toExternalBN(
            res.poolInfo[key].marketCap
          );
        });
        resolve(res);
      })
      .catch(e => reject(e));
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
