import { HydraApiPromise } from '../../src/types';

export const getAllPoolInfo = async (api: HydraApiPromise) => {
  const poolsList = await api.query.xyk.poolAssets.entries();
  const parsedPoolsList = poolsList.map(item => {
    return [item[0].toHuman(), item[1].toHuman()];
  });
  const pools = [];

  if (parsedPoolsList) {
    for (let i = 0; i < parsedPoolsList.length; i++) {
      if (parsedPoolsList[i] && parsedPoolsList[i][0] && parsedPoolsList[i][1]) {
        // @ts-ignore
        const poolId = parsedPoolsList[i][0][0];
        // @ts-ignore
        const asset1Id = parsedPoolsList[i][1][0];
        // @ts-ignore
        const asset2Id = parsedPoolsList[i][1][1];
        const asset1Amount = await api.hydraDx.query.getTokenAmount(poolId, asset1Id, 'free');
        const asset2Amount = await api.hydraDx.query.getTokenAmount(poolId, asset2Id, 'free');
    
        pools.push({
          accountAddress: poolId,
          asset1Id,
          asset2Id,
          asset1Amount: asset1Amount.toString(),
          asset2Amount: asset2Amount.toString(),
        })
      }
    }
  }

  return pools;
}
