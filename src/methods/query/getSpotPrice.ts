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
 * @param asset0Id
 * @param asset1Id
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain
 * @param blockHash
 */
export async function getSpotPriceLbp(
  asset0Id: string,
  asset1Id: string,
  blockHash?: string | null | undefined,
  poolAccount?: string | null | undefined
): Promise<BigNumber | null> {
  const api = Api.getApi();
  if (!api) return null;

  try {
    const poolInfo = await getPoolInfoLbp({
      asset0Id,
      asset1Id,
      poolAccount,
    });

    if (!poolInfo) return null;

    const relayChainBlockHeight = await getBlockHeightRelayChain(blockHash);

    if (!relayChainBlockHeight) return null;

    const assetsWeights = await getPoolAssetsWeightsLbp(
      poolInfo.saleStart,
      poolInfo.saleEnd,
      poolInfo.initialWeight,
      poolInfo.finalWeight,
      relayChainBlockHeight
    );

    const asset0Amount = getTokenAmount(
      poolInfo.poolId,
      asset0Id,
      'free',
      blockHash
    );
    const asset1Amount = getTokenAmount(
      poolInfo.poolId,
      asset1Id,
      'free',
      blockHash
    );

    if (asset0Amount === null || asset1Amount === null) return null;

    return new BigNumber(
      wasmUtils.lbp.getSpotPrice(
        asset0Amount.toString(),
        asset1Amount.toString(),
        assetsWeights.asset0Weight.toString(),
        assetsWeights.asset1Weight.toString()
      )
    );
  } catch (e: any) {
    console.log(e);
    return null;
  }
}
