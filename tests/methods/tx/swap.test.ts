import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';

import { addLiquidity } from '../../../src/methods/tx/addLiquidity';
import { createPool } from '../../../src/methods/tx/createPool';
import { getPoolInfo } from '../../../src/methods/query';
import { swap } from '../../../src/methods/tx/swap';
import { getAliceAccount } from '../../utils/getAliceAccount';
import BigNumber from 'bignumber.js';

let api: HydraApiPromise;

test('Test swap', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  let poolInfo = await api.hydraDx.query.getPoolInfo(alice.address);

  if (!poolInfo.tokenTradeMap[asset1].includes(parseInt(asset2))) {
    try {
      await createPool(asset1.toString(), asset2.toString(), new BigNumber('0.02').multipliedBy('1e12'), new BigNumber('2').multipliedBy('1e18'), alice);
    } catch (e) {
      // NO-OP
    }
  }

  let result : any = await swap({
    asset1Id: asset1.toString(), 
    asset2Id: asset2.toString(), 
    amount: new BigNumber('0.001').multipliedBy('1e12'), 
    actionType: 'sell', 
    expectedOut: '',
    slippage: new BigNumber(1), 
    account: alice
  });
  expect(result.data[0].method).toBe('IntentionRegistered');
});
