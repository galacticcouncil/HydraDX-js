import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test getSpotPriceLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const weightsScope = await api.basilisk.query.getPoolAssetsWeightsLbp('0', '1');
  console.log('weightsScope >>> - ', weightsScope)
  expect(weightsScope).not.toBe(null);

});
