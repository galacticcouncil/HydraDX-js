import BigNumber from 'bignumber.js';
import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../utils/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';

test('Test getPoolAssetsAmount structure', async () => {
  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await destroyAllPools(api, alice);
  await createPool(api, alice, asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  
  const address = await createPool(api, alice, asset2.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  const result = await api.hydraDx.query.getPoolAssetsAmounts(asset2.toString(), (asset2 + 1).toString());

  expect(result).toEqual({
    asset1: '1000000000000',
    asset2: '1000000000000',
    accountAddress: address,
  });
});
