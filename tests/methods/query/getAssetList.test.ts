import Api from '../../../src/api';
import { AssetRecord, HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { generateBlockHash } from '../../utils/constants'

let api: HydraApiPromise;
let BLOCK_HASH: string;

beforeAll(async () => {
  BLOCK_HASH = await generateBlockHash();
})

test('Test getAssetList structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList();
  
  expect(assetList.slice(0, 11)).toEqual(
    [
      {
        assetId: 0,
        name: 'HDX'
      },
      {
        assetId: 1,
        name: "tKSM",
      },
      {
        assetId: 2,
        name: "tDOT",
      },
      {
        assetId: 3,
        name: "tETH",
      },
      {
        assetId: 4,
        name: "tACA",
      },
      {
        assetId: 5,
        name: "tEDG",
      },
      {
        assetId: 6,
        name: "tUSD",
      },
      {
        assetId: 7,
        name: "tPLM",
      },
      {
        assetId: 8,
        name: "tFIS",
      },
      {
        assetId: 9,
        name: "tPHA",
      },
      {
        assetId: 10,
        name: "tUSDT",
      }
    ]
  );
});

test('Test getAssetList at specific block', async () => {
  api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList: AssetRecord[] = await api.hydraDx.query.getAssetList(alice.address, BLOCK_HASH);
  expect(assetList.length).toBeGreaterThanOrEqual(1);
});
