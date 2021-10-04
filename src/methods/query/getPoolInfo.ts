import BigNumber from 'bignumber.js';
import { PoolInfo, TokenTradeMap } from '../../types';
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { getAssetPrices } from '../../utils';
import { wasm } from './index';

import { toExternalBN } from '../../utils';

export async function getPoolInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) return reject();
      const allPools = await api.query.xyk.poolAssets.entries();
      const allTokens = await api.query.xyk.shareToken.entries();
      const poolInfo: PoolInfo = {};

      const shareTokenIds: number[] = [];
      const tokenTradeMap: TokenTradeMap = {};
      const priceUnit = new BigNumber(1).multipliedBy('1e12');

      let parsedPoolsList = allPools.map(item => {
        return [item[0].toHuman(), item[1].toHuman()];
      });

      allPools.forEach(([key, value]) => {
        const poolId = key.toHuman()?.toString() || 'ERR';
        const poolAssets = api
          .createType('Vec<u32>', value)
          .map(assetId => assetId.toNumber())
          .sort((a, b) => a - b);

        poolAssets.forEach((asset, key) => {
          const otherAsset = poolAssets[+!key];

          if (!tokenTradeMap[asset]) tokenTradeMap[asset] = [];
          if (tokenTradeMap[asset].indexOf(otherAsset) === -1) {
            tokenTradeMap[asset].push(otherAsset);
          }
        });

        poolInfo[poolId] = {
          poolAssets,
          shareToken: 99999,
          poolAssetNames: [],
        };
      });

      for (let i = 0; i < allPools.length; i++) {
        const [key, value] = allPools[i];

        const poolId = key.toHuman()?.toString() || 'ERR';
        const poolAssets = api
          .createType('Vec<u32>', value)
          .map(assetId => assetId.toNumber())
          .sort((a, b) => a - b);
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

        let promises2 = poolAssetAmounts.map(assetAmounts => {
          if (assetAmounts) {
            return wasm.get_spot_price(
              assetAmounts.asset1,
              assetAmounts.asset2,
              '1000000000000'
            );
          }
          return null;
        });

        promises2 = promises2.filter(promise => promise);

        let spotPrices = await Promise.all(promises2);

        for (let i = 0; i < spotPrices.length; i++) {
          poolAssetAmounts[i].spotPrice = new BigNumber(spotPrices[i]);
        }

        const poolAssetsAmount = await getPoolAssetsAmounts(
          poolAssets[0].toString(),
          poolAssets[1].toString()
        );
        const assetPrices = getAssetPrices(
          tokenTradeMap,
          parsedPoolsList,
          poolAssetAmounts
        );

        if (
          poolAssetsAmount &&
          poolAssetsAmount.asset1 &&
          poolAssetsAmount.asset2
        ) {
          const asset1Price = new BigNumber(poolAssetsAmount.asset1)
            .multipliedBy(assetPrices[poolAssets[0]])
            .dividedBy(priceUnit);
          const asset2Price = new BigNumber(poolAssetsAmount.asset2)
            .multipliedBy(assetPrices[poolAssets[1]])
            .dividedBy(priceUnit);
          const marketCap = asset1Price.plus(asset2Price);

          if (poolInfo[poolId]) {
            poolInfo[poolId].poolAssetsAmount = {
              asset1: new BigNumber(poolAssetsAmount.asset1),
              asset2: new BigNumber(poolAssetsAmount.asset2),
            };
            poolInfo[poolId].marketCap = marketCap;
          }
        }
      }

      allTokens.forEach(([key, value]) => {
        const poolId = key.toHuman()?.toString() || 'ERR';
        const shareToken = api.createType('u32', value).toNumber();

        shareTokenIds.push(shareToken);

        poolInfo[poolId].shareToken = shareToken;
      });

      resolve({
        tokenTradeMap,
        shareTokenIds,
        poolInfo,
      });
    } catch (e: any) {
      reject(e);
    }
  });
}
