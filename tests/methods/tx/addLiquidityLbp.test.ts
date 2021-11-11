import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPoolLbp } from '../../../src/methods/tx/createPoolLbp';
import { addLiquidityLbp } from '../../../src/methods/tx/addLiquidityLbp';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';
import { getFormattedAddress } from '../../../src/utils';

let api: HydraApiPromise;

test('Test addLiquidity', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await destroyAllPools(api, alice, 'lbp');

  try {
    await createPoolLbp({
      poolOwner: alice!,
      assetA: asset1,
      assetAAmount: new BigNumber(100),
      assetB: asset2,
      assetBAmount: new BigNumber(100),
      initialWeight: new BigNumber(10000000),
      finalWeight: new BigNumber(90000000),
      weightCurve: 'Linear',
      fee: {
        numerator: new BigNumber(2),
        denominator: new BigNumber(10),
      },
      feeCollector: alice!,
      isSudo: true,
    });
  } catch (e) {
    // NO-OP
  }

  await addLiquidityLbp({
    asset1Id: asset1,
    asset2Id: asset2,
    amount: new BigNumber(1),
    maxSellPrice: new BigNumber(1),
    account: alice,
  });

  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  // @ts-ignore
  expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('1.000000000001');
});
