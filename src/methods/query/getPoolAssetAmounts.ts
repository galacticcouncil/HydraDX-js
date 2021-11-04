import Api from '../../api';
import { getTokenAmount } from './getTokenAmount';
import { getPoolInfoLbp } from './getPoolInfo';
import BigNumber from 'bignumber.js';

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
 * @param asset0Id
 * @param asset1Id: string | null
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need fetch poolInfo by asset IDs)
 * @param blockHash?: string | undefined
 */
export const getPoolAssetsAmountsLbp = async (
  asset0Id: string,
  asset1Id: string,
  poolAccount: string | null | undefined,
  blockHash?: string | undefined
): Promise<{
  asset0: BigNumber;
  asset1: BigNumber;
} | null> => {
  if (!asset0Id || !asset1Id) return null;

  const api = Api.getApi();
  if (!api) return null;

  let currentPoolAccount = poolAccount;

  if (!currentPoolAccount) {
    const currentPool = await getPoolInfoLbp({
      asset0Id,
      asset1Id,
    });

    if (currentPool === null) return null;

    currentPoolAccount = currentPool.poolId;
  }

  const asset0Amount = await getTokenAmount(
    currentPoolAccount,
    asset0Id,
    'free',
    blockHash
  );
  const asset1Amount = await getTokenAmount(
    currentPoolAccount,
    asset1Id,
    'free',
    blockHash
  );

  if (asset0Amount === null || asset1Amount === null) return null;

  return {
    asset0: asset0Amount,
    asset1: asset1Amount,
  };
};
