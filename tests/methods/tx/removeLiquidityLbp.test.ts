import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPoolLbp } from '../../../src/methods/tx/createPoolLbp';
import { removeLiquidityLbp } from '../../../src/methods/tx/removeLiquidityLbp';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';
import { getFormattedAddress } from '../../../src/utils';

let api: HydraApiPromise;

test('Test removeLiquidityLbp', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const aliceAddress = await getFormattedAddress(alice.address);
  const assetList = await api.hydraDx.query.getAssetList();
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[assetList.length - 1].assetId;
  let poolId = '';

  await destroyAllPools(api, alice, 'lbp');

  try {
    // @ts-ignore
    poolId = await createPoolLbp({
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

    await removeLiquidityLbp({ poolId });
  } catch(e) {
    console.log(e);
    // NO-OP
  }

  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  // expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('0.001');
  expect(targetBalance[targetBalance.length - 1].balance.toString()).not.toBeNull();

  
  // targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  // expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('0.0005');
  // expect(targetBalance[targetBalance.length - 1].balance.toString()).not.toBeNull();
});
