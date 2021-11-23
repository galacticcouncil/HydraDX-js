import BigNumber from 'bignumber.js';
import Api from '../../api';
import {
  getPoolAssetsAmounts,
  getPoolAssetsAmountsXyk,
} from './getPoolAssetAmounts';

import { getPoolInfoLbp } from './getPoolInfo';
import { getTokenAmount } from './getTokenAmount';
import { getPoolAssetsWeightsLbp } from './getPoolAssetsWeights';
import { getBlockHeightRelayChain } from './getBlockHeightRelayChain';

import wasmUtils from '../../utils/wasmUtils';
import { ApiBaseError, ApiInstanceError } from '../../utils/errorHandling';

export async function getSpotPrice(
  asset1Id: string,
  asset2Id: string,
  blockHash?: string | undefined
) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        const assetsAmounts = await getPoolAssetsAmounts(
          asset1Id,
          asset2Id,
          blockHash
        );

        if (
          assetsAmounts === null ||
          assetsAmounts.asset1 === null ||
          assetsAmounts.asset2 === null
        )
          return;

        const price = new BigNumber(
          wasmUtils.xyk.getSpotPrice(assetsAmounts.asset1, assetsAmounts.asset2)
        );
        resolve(price);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}

/**
 * Provides price for one unit (1000000000000) of asset1 in XYK section.
 * @param asset1Id
 * @param asset2Id
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need search pool account
 *        by asset IDs)
 * @param blockHash
 */
export async function getSpotPriceXyk(
  asset1Id: string,
  asset2Id: string,
  poolAccount?: string | null | undefined,
  blockHash?: string | undefined
) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        const assetsAmounts = await getPoolAssetsAmountsXyk(
          asset1Id,
          asset2Id,
          poolAccount,
          blockHash
        );

        if (
          assetsAmounts === null ||
          assetsAmounts.asset1 === null ||
          assetsAmounts.asset2 === null
        )
          return;

        const price = new BigNumber(
          wasmUtils.xyk.getSpotPrice(assetsAmounts.asset1, assetsAmounts.asset2)
        );
        resolve(price);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}

/**
 * Provides price for one unit (1000000000000) of asset0 in LBP section.
 * @param assetAId
 * @param assetBId
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain
 * @param blockHash
 */
export async function getSpotPriceLbp(
  assetAId: string,
  assetBId: string,
  poolAccount?: string,
  blockHash?: string
): Promise<BigNumber> {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) throw new ApiInstanceError('getSpotPriceLbp');

      const poolInfo = await getPoolInfoLbp({
        assetAId: assetAId,
        assetBId: assetBId,
        poolAccount,
      });

      const relayChainBlockHeight = await getBlockHeightRelayChain(blockHash);

      const assetsWeights = await getPoolAssetsWeightsLbp(
        poolInfo.saleStart,
        poolInfo.saleEnd,
        poolInfo.initialWeight,
        poolInfo.finalWeight,
        relayChainBlockHeight
      );

      const asset0Amount = await getTokenAmount(
        poolInfo.poolId,
        assetAId,
        'free',
        blockHash
      );
      const asset1Amount = await getTokenAmount(
        poolInfo.poolId,
        assetBId,
        'free',
        blockHash
      );

      resolve(
        new BigNumber(
          wasmUtils.lbp.getSpotPrice(
            asset0Amount.toString(),
            asset1Amount.toString(),
            assetsWeights.assetAWeight.toString(),
            assetsWeights.assetBWeight.toString()
          )
        )
      );
    } catch (e: any) {
      reject(e);
    }
  });
}
