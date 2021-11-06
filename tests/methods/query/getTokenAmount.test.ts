import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { generateBlockHash } from '../../utils';
import { createPool } from '../../utils/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';

let BLOCK_HASH: string;

beforeAll(async () => {
  BLOCK_HASH = await generateBlockHash();
})

test('Test getTokenAmount structure', async () => {
  let price;

  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  let assetList = await api.hydraDx.query.getAssetList();
  let baseTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free');
  let reducedTokenAmount;

  const asset1 = assetList[0].assetId.toString();
  const asset2 = assetList[assetList.length - 1].assetId.toString();
  
  await createPool(api, alice, asset1, asset2, new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  assetList = await api.hydraDx.query.getAssetList();
  price = await api.hydraDx.query.getTokenAmount(alice.address, assetList[assetList.length - 1].assetId.toString(), 'free');
  reducedTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free');

  expect(price.toString()).toBe('1000000000');
  expect(BigInt(reducedTokenAmount.toString())).toBeLessThan(BigInt(baseTokenAmount.toString()) - BigInt('1000000000'));
});

test('Test getTokenAmount at specific block', async () => {
  let price;

  const api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  let assetList = await api.hydraDx.query.getAssetList();
  let baseTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free', BLOCK_HASH);
  let reducedTokenAmount;

  const asset1 = assetList[0].assetId.toString();
  const asset2 = assetList[1].assetId.toString();
  
  await createPool(api, alice, asset1, asset2, new BigNumber('1').multipliedBy('1e12'), new BigNumber('1').multipliedBy('1e18'));
  assetList = await api.hydraDx.query.getAssetList();
  price = await api.hydraDx.query.getTokenAmount(alice.address, assetList[assetList.length - 1].assetId.toString(), 'free',  BLOCK_HASH);
  reducedTokenAmount = await api.hydraDx.query.getTokenAmount(alice.address, assetList[0].assetId.toString(), 'free',  BLOCK_HASH);

  expect(price && price.toString()).toBe('1000000000000');
  expect(BigInt(reducedTokenAmount.toString())).toBeLessThan(BigInt(baseTokenAmount.toString()) - BigInt('1000000000'));
});