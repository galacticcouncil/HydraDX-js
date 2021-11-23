import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../../src/methods/tx/createPool';
import { addLiquidity } from '../../../src/methods/tx/addLiquidity';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { destroyAllPools } from '../../utils';

let api: HydraApiPromise;

test('Test addLiquidity', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;

  await destroyAllPools(api, alice);
  try {
    await createPool(asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'), alice);
  } catch (e) {
    // NO-OP
  }
  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('1');

  await addLiquidity(asset1.toString(), asset2.toString(), new BigNumber('1'), new BigNumber('1'), alice);
  targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  expect(targetBalance[targetBalance.length - 1].balance.toString()).toBe('1.000000000001');

  try {
    await addLiquidity(asset1.toString(), asset2.toString(), new BigNumber('0'), new BigNumber('0'), alice);
  } catch(e) {
    expect(e.type).toBe('ExtrinsicFailed');
    expect(e.data[0].name).toBe('CannotAddZeroLiquidity');
  }

  try {
    await addLiquidity(asset1.toString(), asset2.toString(), new BigNumber('-1'), new BigNumber('-1'), alice);
  } catch (e) {
    expect(e.data[0]).toMatch('Negative number passed to unsigned type');
  }
});
