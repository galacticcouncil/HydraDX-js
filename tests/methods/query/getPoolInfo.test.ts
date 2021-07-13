import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import BigNumber from 'bignumber.js';

let api: HydraApiPromise;

test('Test getPoolInfo structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  let poolInfo = await api.hydraDx.query.getPoolInfo(alice.address);

  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId.toString();
  const asset2 = assetList[1].assetId.toString();
  const address = await createPool(api, alice, asset1, asset2, new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));

  let expectedPoolInfo = {...poolInfo};

  expectedPoolInfo.poolInfo[address] = {
    poolAssetNames: [],
    poolAssets: [parseInt(asset1), parseInt(asset2)],
    shareToken: assetList.length,
  };

  expectedPoolInfo.shareTokenIds.push(assetList.length);
  expectedPoolInfo.tokenTradeMap[asset1] = expectedPoolInfo.tokenTradeMap[asset1] || [];
  expectedPoolInfo.tokenTradeMap[asset2] = expectedPoolInfo.tokenTradeMap[asset2] || [];
  expectedPoolInfo.tokenTradeMap[asset1].push(parseInt(asset2));
  expectedPoolInfo.tokenTradeMap[asset2].push(parseInt(asset1));

  poolInfo = await api.hydraDx.query.getPoolInfo(alice.address);

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
