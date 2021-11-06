import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { generateBlockHash } from '../../utils';
import { createPool } from '../../utils/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';

let BLOCK_HASH: string;

beforeAll(async () => {
  BLOCK_HASH = await generateBlockHash();
})

test('Test getPoolAssetsAmount structure', async () => {
  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList();

  const asset1 = assetList[0].assetId;
  const asset2 = assetList[assetList.length - 1].assetId;
  
  await createPool(api, alice, asset1.toString(), asset2.toString(), '1000000000', '500000000');
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), '1000000000', '500000000');
  
  const address = await createPool(api, alice, asset2.toString(), (asset2 + 1).toString(), '1000000000', '500000000');
  const result = await api.hydraDx.query.getPoolAssetsAmounts(asset2.toString(), (asset2 + 1).toString());

  expect(result).toEqual({
    asset1: '1000000000',
    asset2: '0',
    accountAddress: address,
  });
});


test('Test getPoolAssetsAmount at block', async () => {
  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList();

  const asset1 = assetList[0].assetId;
  const asset2 = assetList[1].assetId;
  
  await createPool(api, alice, asset1.toString(), asset2.toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  await createPool(api, alice, asset1.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  
  const address = await createPool(api, alice, asset2.toString(), (asset2 + 1).toString(), new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  const result = await api.hydraDx.query.getPoolAssetsAmounts(asset2.toString(), (asset2 + 1).toString(), BLOCK_HASH);

  expect(result).not.toBe(null);
});