import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { getFormattedAddress, toExternalBN } from '../../../src/utils';

test('Test createPoolLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();

  const aliceAddress = await getFormattedAddress(alice.address);

  // await api.basilisk.tx.setBalanceSudo(
  //   aliceAddress!,
  //   '1',
  //   new BigNumber(1000),
  //   new BigNumber(0)
  // );
  // await api.basilisk.tx.setBalanceSudo(
  //   aliceAddress!,
  //   '0',
  //   new BigNumber(1000),
  //   new BigNumber(0)
  // );

  const newPool = await api.basilisk.tx.createPoolLbp({
    poolOwner: aliceAddress!,
    assetA: '100',
    assetAAmount: new BigNumber(100),
    assetB: '101',
    assetBAmount: new BigNumber(100),
    initialWeight: new BigNumber(10000000),
    finalWeight: new BigNumber(90000000),
    weightCurve: 'Linear',
    fee: {
      numerator: new BigNumber(2),
      denominator: new BigNumber(10),
    },
    feeCollector: aliceAddress!,
    isSudo: false,
  });

  console.log('>>>>> newPool - ', newPool);

  expect(newPool).not.toBe(null);
});
