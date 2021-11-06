import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';

import { transfer } from '../../utils/transfer';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { getRandomAccount } from '../../utils/getRandomAccount';
import { generateBlockHash } from '../../utils';

let api: HydraApiPromise;
let BLOCK_HASH: string;

beforeAll(async () => {
  BLOCK_HASH = await generateBlockHash();
})

test('Test getAccountBalances structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const target = getRandomAccount();
  let targetBalance = await api.hydraDx.query.getAccountBalances(target.address);
  const initialBalance = Number(targetBalance[0].balance.toString())
  expect(initialBalance).toBeGreaterThanOrEqual(0);
  const amount: BigNumber = new BigNumber('1000000000000');

  expect(targetBalance[0].balanceFormatted).toBe('0');

  await transfer(api, target.address, alice, '1000000000000');
  targetBalance = await api.hydraDx.query.getAccountBalances(target.address);

  expect(targetBalance[0].balanceFormatted).toBe('1000000000000');
});


test('Test getAccountBalance at block', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  let userBalance = await api.hydraDx.query.getAccountBalances(alice.address, BLOCK_HASH);
  // console.log("TRANSACTION", userBalance[0].balance.toString())

  expect(userBalance[0].balance.toString()).not.toBe(null);
});