import BigNumber from 'bignumber.js';
import Api from '../../api';
import {
  getPoolAssetsAmounts,
  getPoolAssetsAmountsXyk,
  getPoolAssetsAmountsWeightsLbp,
} from './getPoolAssetAmounts';
import { getTokenAmount, wasm } from './index';

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
          await wasm.xyk.get_spot_price(
            assetsAmounts.asset1,
            assetsAmounts.asset2,
            '1000000000000'
          )
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
          await wasm.xyk.get_spot_price(
            assetsAmounts.asset1,
            assetsAmounts.asset2,
            '1000000000000'
          )
        );
        resolve(price);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}

/**
 * Provides price for one unit (1000000000000) of asset1 in LBP section.
 * @param asset1Id
 * @param asset2Id
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need search pool account
 *        by asset IDs)
 * @param blockHash
 */
export async function getSpotPriceLbp(
  asset1Id: string,
  asset2Id: string,
  poolAccount?: string | null | undefined,
  blockHash?: string | undefined
) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        const assetsAmounts = await getPoolAssetsAmountsWeightsLbp(
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
          await wasm.lbp.get_spot_price(
            assetsAmounts.asset1,
            assetsAmounts.asset2,
            assetsAmounts.asset1Weight,
            assetsAmounts.asset2Weight,
            '1000000000000'
          )
        );
        resolve(price);
      } else {
        throw new Error('API is not available');
      }
    } catch (e: any) {
      reject(e);
    }
  });
}
