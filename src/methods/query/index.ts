import type { Codec } from '@polkadot/types/types';
import type { Balance } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';

import { toInternalBN, toExternalBN } from '../../utils';
import { AssetBalance } from '../../types';

export interface AccountAmount extends Codec {
  free?: Balance;
}

// import { getAccountBalances } from './getAccountBalances';
import { getAssetList } from './getAssetList';
import {
  getPoolInfo as _getPoolInfo,
  getPoolsInfoXyk as _getPoolsInfoXyk,
} from './getPoolInfo';
// import { getSpotPrice } from './getSpotPrice';
import { getTokenAmount } from './getTokenAmount';
import {
  getPoolAssetsAmounts, // TODO add toExternalBN conversion
  // getPoolAssetsAmountsXyk as _getPoolAssetsAmountsXyk,  // TODO add toExternalBN conversion
  getPoolAssetsAmountsLbp as _getPoolAssetsAmountsLbp,
} from './getPoolAssetAmounts';

import { calculateSpotAmount as _calculateSpotAmount } from './calculateSpotAmount';
import { getTradePrice as _getTradePrice } from './getTradePrice';
import { getFreeTokenAmount } from './getFreeTokenAmount';
import { getReservedTokenAmount } from './getReservedTokenAmount';
import { getFrozenFeeTokenAmount } from './getFrozenFeeTokenAmount';
import { getMiscFrozenTokenAmount } from './getMiscFrozenTokenAmount';
import { getMarketcap } from './getMarketcap';
import { getMaxReceivedTradeAmount as _getMaxReceivedTradeAmount } from './getMaxReceivedTradeAmount';
import { getMinReceivedTradeAmount as _getMinReceivedTradeAmount } from './getMinReceivedTradeAmount';

import { getBlockHeightRelayChain } from './getBlockHeightRelayChain';
import { getPoolAssetsWeightsLbp } from './getPoolAssetsWeights';

import { getAccountBalances as _getAccountBalances } from './getAccountBalances';
import {
  getSpotPrice as _getSpotPrice,
  getSpotPriceXyk as _getSpotPriceXyk,
  getSpotPriceLbp as _getSpotPriceLbp,
} from './getSpotPrice';

/**
 * @deprecated
 */
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
  actionType: string,
  blockHash?: string | undefined
) => {
  return Promise.resolve(
    toExternalBN(
      await _getTradePrice(
        asset1Id,
        asset2Id,
        toInternalBN(tradeAmount),
        actionType,
        blockHash
      )
    )
  );
};

const getSpotPrice = async (
  asset1Id: string,
  asset2Id: string,
  blockHash?: string | undefined
) => {
  return Promise.resolve(
    toExternalBN(await _getSpotPrice(asset1Id, asset2Id, blockHash))
  );
};

const getSpotPriceXyk = async (
  asset1Id: string,
  asset2Id: string,
  poolAccount?: string | null | undefined,
  blockHash?: string | undefined
) => {
  return Promise.resolve(
    toExternalBN(
      await _getSpotPriceXyk(asset1Id, asset2Id, poolAccount, blockHash)
    )
  );
};
const getSpotPriceLbp = async (
  asset0Id: string,
  asset1Id: string,
  blockHash?: string | null | undefined,
  poolAccount?: string | null | undefined
) => {
  return Promise.resolve(
    toExternalBN(
      await _getSpotPriceLbp(asset0Id, asset1Id, blockHash, poolAccount)
    )
  );
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

const getPoolAssetsAmountsLbp = (
  asset0Id: string,
  asset1Id: string,
  poolAccount: string | null | undefined,
  blockHash?: string | undefined
): Promise<{
  asset0: BigNumber;
  asset1: BigNumber;
} | null> => {
  return new Promise((resolve, reject) => {
    _getPoolAssetsAmountsLbp(asset0Id, asset1Id, poolAccount, blockHash)
      .then(
        (
          amounts: {
            asset0: BigNumber;
            asset1: BigNumber;
          } | null
        ) => {
          if (amounts === null) {
            resolve(null);
            return;
          }
          resolve({
            asset0: toExternalBN(amounts.asset0)!,
            asset1: toExternalBN(amounts.asset1)!,
          });
        }
      )
      .catch(e => reject(null));
  });
};

const getPoolInfo = (blockHash?: string | undefined) => {
  return new Promise((resolve, reject) => {
    _getPoolInfo(blockHash)
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

const getPoolsInfoXyk = (blockHash?: string | undefined) => {
  return new Promise((resolve, reject) => {
    _getPoolsInfoXyk(blockHash)
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


/**
 * If we export new method, it must be added to methods expose
 * list in "./src/utils/apiUtils.ts"
 */

export default {
  getAccountBalances,
  getAssetList,
  getPoolInfo,
  getPoolsInfoXyk,
  getSpotPrice,
  getSpotPriceXyk,
  getSpotPriceLbp,
  getTokenAmount,
  getPoolAssetsAmounts,
  getPoolAssetsAmountsLbp,
  calculateSpotAmount,
  getTradePrice,
  getFreeTokenAmount,
  getReservedTokenAmount,
  getFrozenFeeTokenAmount,
  getMiscFrozenTokenAmount,
  getMarketcap,
  getMaxReceivedTradeAmount,
  getMinReceivedTradeAmount,
  getBlockHeightRelayChain,
  getPoolAssetsWeightsLbp,
};
