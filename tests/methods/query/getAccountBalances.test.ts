import BigNumber from 'bignumber.js';
import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';

import { transfer } from '../../utils/transfer';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { getRandomAccount } from '../../utils/getRandomAccount';

let api: HydraApiPromise;

test('Test getAccountBalances structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const target = getRandomAccount();
  let targetBalance = await api.hydraDx.query.getAccountBalances(target.address);

  expect(targetBalance[0].balance.toString()).toBe('0');

  await transfer(api, target.address, alice, new BigNumber('1000000000000'));
  targetBalance = await api.hydraDx.query.getAccountBalances(target.address);

  expect(targetBalance[0].balance.toString()).toBe('1000000000000');
});
