import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';
import { getAliceAccount } from '../../utils/getAliceAccount';
import {
  getFormattedAddress,
  toExternalBN,
  getAccountKeyring,
} from '../../../src/utils';
import { AddressOrPair, Signer } from '@polkadot/api/types';

test('Test createPoolLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  // const alice = getAliceAccount();
  const alice = getAccountKeyring('//Alice');

  const aliceAddress = await getFormattedAddress(alice.address);

  await api.basilisk.tx.setBalanceSudo(
    aliceAddress!,
    '1',
    new BigNumber(1000000),
    new BigNumber(0)
  );
  await api.basilisk.tx.setBalanceSudo(
    aliceAddress!,
    '0',
    new BigNumber(1000000),
    new BigNumber(0)
  );

  const newPool = await api.basilisk.tx.createPool(
    '0',
    '1',
    new BigNumber('10000'),
    new BigNumber('123456'),
    alice!
  );

  console.log('>>>>> newPool - ', newPool);

  expect(newPool).not.toBe(null);
});
