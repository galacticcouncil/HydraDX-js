import Api from '../../api';
import { getTokenAmount } from './getTokenAmount';
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
 * getPoolAssetsAmountsWeightsLbp fetches amounts for pair of assets within pool.
 * @param asset1Id: string | null
 * @param asset2Id: string | null
 * @param poolAccount: string | null | undefined - if pool account is specified, it will
 *        reduce number of requests to the chain (we do not need search pool account
 *        by asset IDs)
 * @param blockHash?: string | undefined
 */
export const getPoolAssetsAmountsWeightsLbp = async (
  asset1Id: string | null,
  asset2Id: string | null,
  poolAccount?: string | null | undefined,
  blockHash?: string | undefined
): Promise<{
  asset1: string | null;
  asset2: string | null;
  asset1Weight: string | null;
  asset2Weight: string | null;
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
      poolsList = await api.query.lbp.poolData.entriesAt(blockHash);
    } else {
      poolsList = await api.query.lbp.poolData.entries();
    }

    // TODO Must be updated for parsing assets weights !!!

    //TODO should be create type for poolsList (api.createType())
    const parsedPoolsList = poolsList.map(item => {
      /**
       * item contains next data:
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
      return [item[0].toHuman(), item[1].toHuman()];
    });

//
//     const poolAddress = 'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS';
//
//     const poolData = await api.query.lbp.poolData.entries()
//
//     const asset0Amount = await api.query.system.account(poolAddress);
//     const asset1Amount = await api.query.tokens.accounts(poolAddress, '1');
//
//     poolData.map(item => {
//       console.log(item)
//       //console.log('item[0] pool address - ', item[0].toHuman())
//       //console.log('item[1] - ', item[1])
//     });
//
// //console.log('poolData - ', poolData );
//
// // console.log('asset0Amount - ', asset0Amount.data );
// // console.log('asset1Amount - ', asset1Amount);

    /**
     * parsedPoolsList has next structure
     * [
     *    [['7MK4PSbXskZhKTiGk4K4w7Ut59ZZndUupZxMHBDxgxiGZgpa'], ['1', '2'], [weightAsset1, weightAsset2]],
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
    asset1Weight: '', // TODO Must be updated
    asset2Weight: '', // TODO Must be updated
    accountAddress: currentPoolId,
  };
};
