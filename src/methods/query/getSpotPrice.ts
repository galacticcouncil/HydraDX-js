import BigNumber from 'bignumber.js';
import Api from '../../api';
import {
  getPoolAssetsAmounts,
} from './getPoolAssetAmounts';
import { getTokenAmount, wasm } from './index';

export async function getSpotPrice(asset1Id: string, asset2Id: string) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        const assetsAmounts = await getPoolAssetsAmounts(asset1Id, asset2Id);

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

export async function getSpotPriceXyk(
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

export async function getSpotPriceLbp(
  asset1Id: string,
  asset2Id: string,
  poolAccount: string,
  blockHash?: string | undefined
) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        let poolDetails = null;

        if (blockHash) {
          poolDetails = await api.query.lbp.poolData.at(blockHash, poolAccount);
        } else {
          poolDetails = await api.query.lbp.poolData(poolAccount);
        }

        if (!poolDetails) return;

        /**
         * TODO "poolDetails" must be parsed and weights must be extracted
         */
        const asset1Weight = '';
        const asset2Weight = '';

        const asset1Amount = await getTokenAmount(
          poolAccount,
          asset1Id,
          'free',
          blockHash
        );
        const asset2Amount = await getTokenAmount(
          poolAccount,
          asset2Id,
          'free',
          blockHash
        );

        if (asset1Amount === null || asset2Amount === null) return;

        const price = new BigNumber(
          await wasm.lbp.get_spot_price(
            asset1Amount.toString(),
            asset2Amount.toString(),
            asset1Weight,
            asset2Weight,
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
