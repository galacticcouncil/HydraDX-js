import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';

let api: HydraApiPromise;

test('Test getAssetList structure', async () => {
  api = await Api.initialize({}, process.env.WS_URL);
  const alice = getAliceAccount();
  const assetList = await api.hydraDx.query.getAssetList(alice.address);
  
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
