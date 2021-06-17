import { KeyringPair } from '@polkadot/keyring/types';

import Api from '../src/api';
import { HydraApiPromise } from '../src/types';
import { getAliceAccount } from './utils/getAliceAccount';
import { createPool } from './utils/createPool';

let api: HydraApiPromise;
let alice: KeyringPair;
let aliceAccount: string;
let assetList: Array<any>;
let asset1: string;
let asset2: string;

test('API object should be undefined at first', () => {
  api = Api.getApi();
  expect(api).toBe(undefined);
});

test('API object should be defined after initialize', async () => {
  api = await Api.initialize({}, process.env.WS_URL);
  alice = getAliceAccount();
  aliceAccount = alice.address;
  expect(api).toBeDefined();
});

test('Test getAccountBalances', async () => {
  const accountBalances = await api.hydraDx.query.getAccountBalances(aliceAccount);
  expect(accountBalances).toBeDefined();
});

test('Test getAssetList', async () => {
  const assetList = await api.hydraDx.query.getAssetList(aliceAccount);
  expect(assetList).toBeDefined();
});

test('Test getPoolInfo', async () => {
  const poolInfo = await api.hydraDx.query.getPoolInfo(aliceAccount);
  expect(poolInfo).toBeDefined();
});

test('Test getSpotPrice', async () => {
  assetList = await api.hydraDx.query.getAssetList(aliceAccount);
  asset1 = assetList[0].assetId.toString();
  asset2 = assetList[assetList.length - 1].assetId.toString();
  
  await createPool(api, alice, asset1, asset2, '1000000000', '500000000');
  
  const spotPrice = await api.hydraDx.query.getSpotPrice(asset1, asset2, '500');
  expect(spotPrice).toBeDefined();
});

test('Test getTradePrice', async () => {
  const tradePrice = await api.hydraDx.query.getTradePrice(asset1, asset2, '500', 'sell');
  expect(tradePrice).toBeDefined();
});

test('Test getTokenAmount', async () => {
  const tokenAmount = await api.hydraDx.query.getTokenAmount(aliceAccount, 0);
  expect(tokenAmount).toBeDefined();
});

test('Test getPoolAssetsAmounts', async () => {
  const tokenAmount = await api.hydraDx.query.getPoolAssetsAmounts(aliceAccount, 0);
  expect(tokenAmount).toBeDefined();
});
