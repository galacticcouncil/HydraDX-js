import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import BigNumber from 'bignumber.js';

let api: HydraApiPromise;

test('Test calculateSpotAmount structure', async () => {
  let price;

  api = await Api.initialize({
    onTxEvent: () => {}
  }, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await createPool(api, alice, asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  await createPool(api, alice, (asset2 + 1).toString(), (asset2 + 2).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));

  price = await api.hydraDx.query.calculateSpotAmount(asset1.toString(), asset2.toString(), new BigNumber('500'));
  expect(price.toString()).toBe('500');

  price = await api.hydraDx.query.calculateSpotAmount(asset1.toString(), (asset2 + 1).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('500');

  price = await api.hydraDx.query.calculateSpotAmount((asset2 + 1).toString(), (asset2 + 2).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('500');

  price = await api.hydraDx.query.calculateSpotAmount((asset2 + 2).toString(), (asset2 + 1).toString(), new BigNumber('500'));
  expect(price.toString()).toBe('500');
});
