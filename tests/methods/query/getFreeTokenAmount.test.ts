import BigNumber from 'bignumber.js'
import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { propose } from '../../utils/propose';

let api: HydraApiPromise;

test('Test getFreeTokenAmount structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();

  let freeTokenOrg = await api.hydraDx.query.getFreeTokenAmount(alice.address, '0');
  let reserveAmount = (new BigNumber('1000')).multipliedBy('1e12');

  await propose(api, alice, '0x0000000000000000000000000000000000000000000000000000000000000000', new BigNumber(reserveAmount.toString()));

  let freeTokenNow = await api.hydraDx.query.getFreeTokenAmount(alice.address, '0');

  expect(freeTokenOrg.isGreaterThan(freeTokenNow.plus(reserveAmount))).toBeTruthy();
});
