import Api from '../../api';
import { getTokenAmount } from './getTokenAmount';

/**
 * getAssetsAmounts fetches amounts for pair of assets within pool.
 * @param asset1Id: string | null
 * @param asset2Id: string | null
 */
export const getPoolAssetsAmounts = async (
  asset1Id: string | null,
  asset2Id: string | null
): Promise<{
  asset1: string | null;
  asset2: string | null;
  accountAddress: string;
} | null> => {
  if (
      (asset1Id !== null && asset1Id.length === 0) ||
      asset1Id === null ||
      (asset2Id !== null && asset2Id.length === 0) ||
      asset2Id === null
  )
    return null;

  const api = Api.getApi();

  if (!api) return null;

  const poolsList = await api.query.xyk.poolAssets.entries();

  //TODO should be create type for poolsList (api.createType())
  const parsedPoolsList = poolsList.map(item => {
    return [item[0].toHuman(), item[1].toHuman()];
  });

  /**
   * parsedPoolsList has next structure
   * [
   *    [['7MK4PSbXskZhKTiGk4K4w7Ut59ZZndUupZxMHBDxgxiGZgpa'], ['1', '2']],
   *    [['7Hx1UVo75qgr8cy7VFqGTL4r99HRVWdn864HFter2aa2LSqW'], ['0', '1']],
   * ]
   */

  const currentPool = parsedPoolsList.find(
      poolInfo =>
          asset1Id !== null &&
          asset2Id !== null &&
          poolInfo[1] &&
          //@ts-ignore
          poolInfo[1].includes(asset1Id) &&
          //@ts-ignore
          poolInfo[1].includes(asset2Id)
  );

  //@ts-ignore
  const currentPoolId = currentPool ? currentPool[0][0] : null;

  if (!currentPoolId) {
    return null;
  }

  const asset1Amount = await getTokenAmount(currentPoolId, asset1Id, 'free');
  const asset2Amount = await getTokenAmount(currentPoolId, asset2Id, 'free');

  return {
    asset1: asset1Amount !== null ? asset1Amount.toString() : null,
    asset2: asset2Amount !== null ? asset2Amount.toString() : null,
    accountAddress: currentPoolId,
  };
};
