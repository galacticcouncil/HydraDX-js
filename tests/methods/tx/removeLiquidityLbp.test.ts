import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../../src/methods/tx/createPool';
import { removeLiquidity } from '../../../src/methods/tx/removeLiquidity';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';
import { getFormattedAddress } from '../../../src/utils';

let api: HydraApiPromise;

test('Test removeLiquidity', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const aliceAddress = await getFormattedAddress(alice.address);

  try {
    await api.basilisk.tx.setBalanceSudo(
      aliceAddress!,
      '1',
      new BigNumber(1000),
      new BigNumber(0)
    );
  } catch(e) {
    console.log(e);
  }

  await api.basilisk.tx.setBalanceSudo(
    aliceAddress!,
    '0',
    new BigNumber(1000),
    new BigNumber(0)
  );

  const newPool = await api.basilisk.tx.createPoolLbp({
    poolOwner: aliceAddress!,
    assetA: '0',
    assetAAmount: new BigNumber(100),
    assetB: '1',
    assetBAmount: new BigNumber(100),
    initialWeight: new BigNumber(10000000),
    finalWeight: new BigNumber(90000000),
    weightCurve: 'Linear',
    fee: {
      numerator: new BigNumber(2),
      denominator: new BigNumber(10),
    },
    feeCollector: aliceAddress!,
    isSudo: true,
  });

  await removeLiquidity('0', '1', new BigNumber('100'), alice);
});
