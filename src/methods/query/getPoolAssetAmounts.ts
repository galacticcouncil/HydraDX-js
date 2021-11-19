import Api from '../../api';
import { getTokenAmount } from './getTokenAmount';
import { getPoolAccountLbp } from './getPoolAccountLbp';
import BigNumber from 'bignumber.js';
import { ApiInstanceError } from '../../utils/errorHandling';

/**
 * getAssetsAmounts fetches amounts for pair of assets within pool.
 * @param asset1Id: string | null
 * @param asset2Id: string | null
 */
export const getPoolAssetsAmounts = async (
  asset1Id: string | null,
  asset2Id: string | null,
  blockHash?: string | undefined
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

  let poolsList = [];

  if (blockHash) {
    poolsList = await api.query.xyk.poolAssets.entriesAt(blockHash);
  } else {
    poolsList = await api.query.xyk.poolAssets.entries();
  }

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

  const asset1Amount = await getTokenAmount(
    currentPoolId,
    asset1Id,
    'free',
    blockHash
  );
  const asset2Amount = await getTokenAmount(
    currentPoolId,
    asset2Id,
    'free',
    blockHash
  );

  return {
    asset1: asset1Amount !== null ? asset1Amount.toString() : null,
    asset2: asset2Amount !== null ? asset2Amount.toString() : null,
    accountAddress: currentPoolId,
  };
};

/**
 * getPoolAssetsAmountsXyk fetches amounts for pair of assets within pool.
 * @param asset1Id: string | null
 * @param asset2Id: string | null
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need search pool account
 *        by asset IDs)
 * @param blockHash?: string | undefined
 */
export const getPoolAssetsAmountsXyk = async (
  asset1Id: string | null,
  asset2Id: string | null,
  poolAccount: string | null | undefined,
  blockHash?: string | undefined
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

  let currentPoolId = poolAccount;

  if (!poolAccount) {
    let poolsList = [];

    if (blockHash) {
      poolsList = await api.query.xyk.poolAssets.entriesAt(blockHash);
    } else {
      poolsList = await api.query.xyk.poolAssets.entries();
    }

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
    currentPoolId = currentPool ? currentPool[0][0] : null;
  }

  if (!currentPoolId) {
    return null;
  }

  const asset1Amount = await getTokenAmount(
    currentPoolId,
    asset1Id,
    'free',
    blockHash
  );
  const asset2Amount = await getTokenAmount(
    currentPoolId,
    asset2Id,
    'free',
    blockHash
  );

  return {
    asset1: asset1Amount !== null ? asset1Amount.toString() : null,
    asset2: asset2Amount !== null ? asset2Amount.toString() : null,
    accountAddress: currentPoolId,
  };
};

/**
 * getPoolAssetsAmountsLbp fetches amounts for pair of assets within pool.
 * @param assetAId
 * @param assetBId
 * @param poolAccount: string | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need fetch poolInfo by asset IDs)
 * @param blockHash?: string | undefined
 */
export const getPoolAssetsAmountsLbp = async (
  assetAId: string,
  assetBId: string,
  poolAccount?: string,
  blockHash?: string
): Promise<{
  assetA: BigNumber;
  assetB: BigNumber;
}> => {
  return new Promise<{
    assetA: BigNumber;
    assetB: BigNumber;
  }>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) throw new ApiInstanceError('getPoolAssetsAmountsLbp');

      let currentPoolAccount = poolAccount;

      if (!currentPoolAccount) {
        currentPoolAccount = await getPoolAccountLbp(assetAId, assetBId);
      }

      const asset0Amount = await getTokenAmount(
        currentPoolAccount,
        assetAId,
        'free',
        blockHash
      );
      const asset1Amount = await getTokenAmount(
        currentPoolAccount,
        assetBId,
        'free',
        blockHash
      );

      resolve({
        assetA: asset0Amount,
        assetB: asset1Amount,
      });
    } catch (e: any) {
      reject(e);
    }
  });
};
