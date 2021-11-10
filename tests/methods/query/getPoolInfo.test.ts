import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import { destroyAllPools } from '../../utils';

let api: HydraApiPromise;

test('Test getPoolInfo structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  await destroyAllPools(api, alice);

  let poolInfo = await api.hydraDx.query.getPoolsInfoXyk(alice.address);
  let assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId.toString();
  const asset2 = assetList[1].assetId.toString();
  const { account, tokenId } = await createPool(api, alice, asset1, asset2, new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  assetList = await api.hydraDx.query.getAssetList(alice.address);

  let expectedPoolInfo = {...poolInfo};

  expectedPoolInfo.poolInfo[account] = {
    poolAssetNames: [],
    poolAssets: [parseInt(asset1), parseInt(asset2)],
    shareToken: parseInt(tokenId),
    marketCap: new BigNumber('2'),
    poolAssetsAmount: {
      asset1: new BigNumber('1'),
      asset2: new BigNumber('1'),
    }
  };

  expectedPoolInfo.shareTokenIds.push(parseInt(tokenId));
  expectedPoolInfo.tokenTradeMap[asset1] = expectedPoolInfo.tokenTradeMap[asset1] || [];
  expectedPoolInfo.tokenTradeMap[asset2] = expectedPoolInfo.tokenTradeMap[asset2] || [];
  expectedPoolInfo.tokenTradeMap[asset1].push(parseInt(asset2));
  expectedPoolInfo.tokenTradeMap[asset2].push(parseInt(asset1));

  poolInfo = await api.hydraDx.query.getPoolsInfoXyk(alice.address);

  poolInfo.shareTokenIds.sort((a: number, b: number) => a - b);
  expectedPoolInfo.shareTokenIds.sort((a: number, b: number) => a - b);

  Object.keys(poolInfo.tokenTradeMap).forEach(key => {
    poolInfo.tokenTradeMap[key].sort((a: number, b: number) => a - b);
  });

  Object.keys(expectedPoolInfo.tokenTradeMap).forEach(key => {
    expectedPoolInfo.tokenTradeMap[key].sort((a: number, b: number) => a - b);
  });

  expect(poolInfo).toEqual(expectedPoolInfo);
});
