import BigNumber from 'bignumber.js';

import Api from '../../api';
import { getAssetPrices } from '../../utils';

import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { getPoolInfo } from './getPoolInfo';
import wasmUtils from '../../utils/wasmUtils';

export async function getMarketcap(assetId1: string, assetId2: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) return reject();

      if ((assetId1 && !assetId2) || (!assetId1 && assetId2)) {
        return reject({
          error: 'None or both assets should be set',
        });
      }

      const poolsList = await api.query.xyk.poolAssets.entries();
      let parsedPoolsList = poolsList.map(item => {
        return [item[0].toHuman(), item[1].toHuman()];
      });

      let promises = parsedPoolsList.map(poolInfo => {
        const assetPair = poolInfo[1];

        if (
          assetPair &&
          Array.isArray(assetPair) &&
          assetPair[0] &&
          assetPair[1]
        ) {
          return getPoolAssetsAmounts(
            assetPair[0].toString(),
            assetPair[1].toString()
          );
        }

        return null;
      });

      promises = promises.filter(promise => promise);

      let poolAssetAmounts: any[] = await Promise.all(promises);
      const poolInfo: any = await getPoolInfo();

      let promises2 = poolAssetAmounts.map(assetAmounts => {
        if (assetAmounts) {
          return wasmUtils.xyk.getSpotPrice(
            assetAmounts.asset1,
            assetAmounts.asset2
          );
        }
        return null;
      });

      promises2 = promises2.filter(promise => promise);

      let spotPrices = await Promise.all(promises2);

      for (let i = 0; i < spotPrices.length; i++) {
        poolAssetAmounts[i].spotPrice = new BigNumber(spotPrices[i]!); // TODO types should be improved
      }

      poolAssetAmounts.forEach(assetAmount => {
        const parsedPool: any = parsedPoolsList.find(
          (pool: any) =>
            pool && pool[0] && pool[0][0] === assetAmount.accountAddress
        );
        assetAmount.assetId1 = parsedPool && parsedPool[1] && parsedPool[1][0];
        assetAmount.assetId2 = parsedPool && parsedPool[1] && parsedPool[1][1];
      });

      const priceUnit = new BigNumber(1).multipliedBy('1e12');
      const assetPrices = getAssetPrices(
        poolInfo.tokenTradeMap,
        parsedPoolsList,
        poolAssetAmounts
      );

      poolAssetAmounts.forEach(assetAmount => {
        const asset1Price = new BigNumber(assetAmount.asset1)
          .multipliedBy(assetPrices[assetAmount.assetId1])
          .dividedBy(priceUnit);
        const asset2Price = new BigNumber(assetAmount.asset2)
          .multipliedBy(assetPrices[assetAmount.assetId2])
          .dividedBy(priceUnit);
        assetAmount.marketCap = asset1Price.plus(asset2Price);
      });

      if (assetId1 && assetId2) {
        poolAssetAmounts = poolAssetAmounts.filter(assetAmounts => {
          return (
            (assetAmounts.assetId1 === assetId1 &&
              assetAmounts.assetId2 === assetId2) ||
            (assetAmounts.assetId1 === assetId2 &&
              assetAmounts.assetId2 === assetId1)
          );
        });
      }

      resolve(poolAssetAmounts);
    } catch (e: any) {
      reject(e);
    }
  });
}
