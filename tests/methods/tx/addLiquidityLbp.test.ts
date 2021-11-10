import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../../src/methods/tx/createPool';
import { addLiquidity } from '../../../src/methods/tx/addLiquidity';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';
import { getFormattedAddress } from '../../../src/utils';

let api: HydraApiPromise;

test('Test addLiquidity', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList();
  // const asset1 = assetList[0].assetId;
  // const asset2 = assetList[1].assetId;
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

  await addLiquidity('0', '1', new BigNumber('1'), new BigNumber('1'), alice);

  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  // @ts-ignore
  expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('1.000000000001');
});
