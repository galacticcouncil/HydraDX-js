import { PoolInfo, TokenTradeMap } from '../../types';
import Api from '../../api';

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
  
      allTokens.forEach(([key, value]) => {
        const poolId = key.toHuman()?.toString() || 'ERR';
        const shareToken = api.createType('u32', value).toNumber();
  
        shareTokenIds.push(shareToken);
  
        poolInfo[poolId].shareToken = shareToken;
      });
  
      resolve({
          tokenTradeMap,
          shareTokenIds,
          poolInfo
      });
    } catch(e) {
      reject(e);
    }
  });
}
