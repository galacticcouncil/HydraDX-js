import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import { addLiquidity } from '../../utils/addLiquidity';

let api: HydraApiPromise;

test('Test getSpotPrice structure', async () => {
  let price;

  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[assetList.length - 1].assetId;

  await createPool(api, alice, asset1.toString(), asset2.toString(), '1000000000', '500000000');
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), '1000000000', '500000000');
  await createPool(api, alice, (asset2 + 1).toString(), (asset2 + 2).toString(), '100000000', '50000000');

  price = await api.hydraDx.query.getSpotPrice(asset1.toString(), asset2.toString());
  expect(price.toString()).toBe('0');

  price = await api.hydraDx.query.getSpotPrice(asset1.toString(), (asset2 + 1).toString());
  expect(price.toString()).toBe('0');

  price = await api.hydraDx.query.getSpotPrice((asset2 + 1).toString(), (asset2 + 2).toString());
  expect(price.toString()).toBe('0');

  price = await api.hydraDx.query.getSpotPrice((asset2 + 2).toString(), (asset2 + 1).toString());
  expect(price.toString()).toBe('0');
});
