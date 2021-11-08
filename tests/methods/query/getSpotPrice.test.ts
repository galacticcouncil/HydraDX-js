import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import { destroyAllPools } from '../../utils';

let api: HydraApiPromise;

test('Test getSpotPrice structure', async () => {
  let price;

  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await destroyAllPools(api, alice);
  await createPool(api, alice, asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('2').multipliedBy('1e18'));
  await createPool(api, alice, (asset2 + 1).toString(), (asset2 + 2).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('2').multipliedBy('1e18'));

  price = await api.hydraDx.query.getSpotPrice(asset1.toString(), asset2.toString());
  expect(price.toString()).toBe('1');

  price = await api.hydraDx.query.getSpotPrice(asset1.toString(), (asset2 + 1).toString());
  expect(price.toString()).toBe('2');

  price = await api.hydraDx.query.getSpotPrice((asset2 + 1).toString(), (asset2 + 2).toString());
  expect(price.toString()).toBe('2');
});
