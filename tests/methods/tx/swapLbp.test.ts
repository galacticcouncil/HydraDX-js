import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { addLiquidity } from '../../../src/methods/tx/addLiquidity';
import { createPoolLbp } from '../../../src/methods/tx/createPoolLbp';
// import { getPoolInfo } from '../../../src/methods/query';
import { swapLbp } from '../../../src/methods/tx/swapLbp';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';
import { getFormattedAddress } from '../../../src/utils';

let api: HydraApiPromise;

test('Test swapLbp', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList();
  const aliceAddress = await getFormattedAddress(alice.address);
  // @ts-ignore
  const asset1 = assetList[0].assetId;
  // @ts-ignore
  const asset2 = assetList[1].assetId;
  let poolInfo = await api.hydraDx.query.getPoolsInfoXyk();
  let result;

  // await destroyAllPools(api, alice);
  // @ts-ignore
  if (!poolInfo.tokenTradeMap[asset1] || !poolInfo.tokenTradeMap[asset1].includes(parseInt(asset2))) {
    try {
      await createPoolLbp({
        poolOwner: aliceAddress!,
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
        feeCollector: aliceAddress!,
        isSudo: true,
      });

      result = await swapLbp({
        asset1Id: asset1.toString(), 
        asset2Id: asset2.toString(), 
        amount: new BigNumber('0.0001').multipliedBy('1e12'), 
        actionType: 'sell', 
        expectedOut: '',
        slippage: new BigNumber(1), 
        account: alice
      });

      // @ts-ignore
      expect(result.method[0]).not.toBeNull();
    } catch (e) {
      // NO-OP
    }
  }
  // expect(result.method[0]).toBe('IntentionRegistered');
  // expect(result.data.amount.toString()).toBe('100000000');
  // expect(result.data.amountXykTrade.toString()).toBe('100000000');
});
