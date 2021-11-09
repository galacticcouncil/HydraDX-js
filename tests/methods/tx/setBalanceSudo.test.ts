import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { getFormattedAddress, toExternalBN } from '../../../src/utils';

test('Test setBalanceSudo query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();

  const aliceAddress = await getFormattedAddress(alice.address);

  const aliceAsset1AmountInitial = await api.basilisk.query.getTokenAmount(
    aliceAddress!,
    '1',
    'free'
  );

  await api.basilisk.tx.setBalanceSudo(
    aliceAddress!,
    '1',
    new BigNumber(111),
    new BigNumber(0)
  );

  const aliceAsset1AmountUpdated = await api.basilisk.query.getTokenAmount(
    aliceAddress!,
    '1',
    'free'
  );

  const isBalanceChanged = toExternalBN(aliceAsset1AmountUpdated)!.isEqualTo(
    new BigNumber(111)
  );

  expect(isBalanceChanged).toBe(true);
});
