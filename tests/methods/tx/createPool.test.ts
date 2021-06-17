import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';

import { createPool } from '../../../src/methods/tx/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';
import BigNumber from 'bignumber.js';

let api: HydraApiPromise;

test('Test createPool', async () => {
  api = await Api.initialize({}, process.env.WS_URL);

  const alice = getAliceAccount();
  let assetList = await api.hydraDx.query.getAssetList(alice.address);
  const asset1 = assetList[0].assetId;
  let asset2 = assetList[assetList.length - 1].assetId;

  await createPool(asset1.toString(), asset2.toString(), new BigNumber('1000000000'), new BigNumber('500000000'), alice);

  let targetBalance = await api.hydraDx.query.getAccountBalances(alice.address);
  expect(targetBalance[targetBalance.length - 1].balanceFormatted).toBe('1000000000');

  assetList = await api.hydraDx.query.getAssetList(alice.address);
  asset2 = assetList[assetList.length - 1].assetId;
  try {
    await createPool(asset1.toString(), asset2.toString(), new BigNumber('0'), new BigNumber('0'), alice);
  } catch(e) {
    expect(e.type).toBe('ExtrinsicFailed');
    expect(e.data[0].name).toBe('CannotCreatePoolWithZeroLiquidity');
  }

  assetList = await api.hydraDx.query.getAssetList(alice.address);
  asset2 = assetList[assetList.length - 1].assetId;
  try {
    await createPool(asset1.toString(), asset2.toString(), new BigNumber('-1'), new BigNumber('-1'), alice);
  } catch(e) {
    expect(e.data[0]).toMatch('Negative number passed to unsigned type');
  }
});
