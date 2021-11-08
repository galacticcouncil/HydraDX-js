import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import { destroyAllPools } from '../../utils';

let api: HydraApiPromise;

test('Test calculateSpotAmount structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const aliceAccount = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(aliceAccount.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await destroyAllPools(api, aliceAccount);
  const promise1 = await createPool(api, aliceAccount, asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  const promise2 = await createPool(api, aliceAccount, asset1.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('2').multipliedBy('1e18'));
  const promise3 = await createPool(api, aliceAccount, (asset2 + 1).toString(), (asset2 + 2).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('2').multipliedBy('1e18'));

  await Promise.all([promise1, promise2, promise3]);

  let price = await api.hydraDx.query.calculateSpotAmount(asset1.toString(), asset2.toString(), new BigNumber('500'));
  expect(price.toString()).toBe('500');

  price = await api.hydraDx.query.calculateSpotAmount(asset1.toString(), (asset2 + 1).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('1000');

  price = await api.hydraDx.query.calculateSpotAmount((asset2 + 1).toString(), (asset2 + 2).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('1000');

  price = await api.hydraDx.query.calculateSpotAmount((asset2 + 2).toString(), (asset2 + 1).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('250');
});
