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

  expect(targetBalance[0].balanceFormatted).toBe(originalBalance[0].balance.plus('1000000000000000').toString());
  expect(targetBalance[1].balanceFormatted).toBe(originalBalance[1].balance.plus('1000000000000000').toString());
  expect(targetBalance[2].balanceFormatted).toBe(originalBalance[2].balance.plus('1000000000000000').toString());
});
