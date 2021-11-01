import BigNumber from 'bignumber.js';
import { PoolInfo, TokenTradeMap } from '../../types';
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { getAssetPrices } from '../../utils';
import { wasm } from './index';

import { toExternalBN } from '../../utils';
import type { AnyJson, Codec } from '@polkadot/types/types';
import Any = jasmine.Any;

// TODO Detailed description is necessary
/**
 * Provides list of all available pools with bunch of pool's details
 */
export async function getPoolInfo(blockHash?: string | undefined) {
  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) return reject();
      const allPools = blockHash
        ? await api.query.xyk.poolAssets.entriesAt(blockHash)
        : await api.query.xyk.poolAssets.entries();
      const allTokens = blockHash
        ? await api.query.xyk.shareToken.entriesAt(blockHash)
        : await api.query.xyk.shareToken.entries();
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
            return wasm.xyk.get_spot_price(
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
          poolAssets[1].toString(),
          blockHash
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

export async function getPoolsInfoXyk(blockHash?: string | undefined) {
  return getPoolInfo(blockHash);
}

export async function getPoolInfoLbp({
  poolAccount,
  asset0Id,
  asset1Id,
}: {
  poolAccount?: string | undefined | null;
  asset0Id?: string | undefined;
  asset1Id?: string | undefined;
}): Promise<{
  poolId: string;
  saleStart: BigNumber;
  saleEnd: BigNumber;
  owner: string;
  initialWeight: BigNumber;
  finalWeight: BigNumber;
  asset0Id: string;
  asset1Id: string;
  weight_curve: string;
  feeNumerator: string;
  feeDenominator: string;
  feeCollector: string;
} | null> {
  // We should terminate execution if required params are not provided
  if (!poolAccount && !asset0Id && !asset1Id) return null;

  const api = Api.getApi();

  if (!api) return null;

  let poolAddress: string | undefined | null | Codec | AnyJson = poolAccount;

  if (!poolAccount) {
    poolAddress = await api.query.lbp.getPoolId(asset0Id, asset1Id);
    poolAddress = poolAddress.toHuman();
  }

  const poolData = await api.query.lbp.poolData(poolAddress);

  if (!poolData) return null;

  /**
   * poolData contains next data:
   *
   * [
   0x60a337a70c97253566bd07d40004200da42dd98ed4bf57282dd6c84814cda5d7c1e43828f6ff5dd0eecfd4e6ac8a70c25f6df23d135610e3100cf79cc7b98637728840383cd037c41cc6deb509f91571,
   {
            owner: bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak,
            start: 0,
            end: 0,
            assets: { asset_in: 0, asset_out: 1 },
            initial_weight: 10000000,
            final_weight: 90000000,
            weight_curve: Linear,
            fee: { numerator: 2, denominator: 100 },
            fee_collector: bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak,
          },
   ]
   *
   */

  const poolDataHuman = poolData.toHuman();

  const {
    owner,
    start,
    end,
    assets: { asset_in, asset_out },
    initial_weight,
    final_weight,
    weight_curve,
    fee: { numerator, denominator },
    fee_collector,
  }: AnyJson = poolDataHuman[1];

  return {
    poolId: poolData[0][0],
    saleStart: new BigNumber(start.toHuman()),
    saleEnd: new BigNumber(start.toHuman()),
    owner: owner.toHuman(),
    initialWeight: new BigNumber(initial_weight.toHuman()),
    finalWeight: new BigNumber(final_weight.toHuman()),
    asset0Id: asset_in.toHuman(),
    asset1Id: asset_out.toHuman(),
    weight_curve: weight_curve.toHuman(),
    feeNumerator: numerator.toHuman(),
    feeDenominator: denominator.toHuman(),
    feeCollector: fee_collector.toHuman(),
  };
}
