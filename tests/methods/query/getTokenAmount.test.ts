import BigNumber from 'bignumber.js';
import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../utils/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';

test('Test getTokenAmount structure', async () => {
  let price;

  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  let assetList = await api.hydraDx.query.getAssetList(alice.address);
  let baseTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free');
  let reducedTokenAmount;

  const asset1 = assetList[0].assetId.toString();
  const asset2 = assetList[1].assetId.toString();
  
  await destroyAllPools(api, alice);
  await createPool(api, alice, asset1, asset2, new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  assetList = await api.hydraDx.query.getAssetList(alice.address);

  let poolInfo = await api.hydraDx.query.getPoolsInfoXyk(alice.address);
  let assetId = poolInfo.shareTokenIds[0];
  
  price = await api.hydraDx.query.getTokenAmount(alice.address, assetList[assetId].assetId.toString(), 'free');
  reducedTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free');

  expect(price.toString()).toBe('1000000000000');
});
