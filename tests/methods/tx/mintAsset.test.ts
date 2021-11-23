import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { mintAsset } from '../../../src/methods/tx/mintAsset';
import { getAliceAccount } from '../../utils/getAliceAccount';

let api: HydraApiPromise;

test('Test mintAsset', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  let originalBalance = await api.hydraDx.query.getAccountBalances(alice.address);

  await mintAsset(alice);

  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);

  expect(targetBalance[0].balance.toString()).toBe(originalBalance[0].balance.plus('1000').toString());
  expect(targetBalance[1].balance.toString()).toBe(originalBalance[1].balance.plus('1000').toString());
  expect(targetBalance[2].balance.toString()).toBe(originalBalance[2].balance.plus('1000').toString());
});
