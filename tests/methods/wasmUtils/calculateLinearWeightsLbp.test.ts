import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test calculateLinearWeightsLbp wasm util function', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const price = api.wasmUtils.lbp.getSpotPrice('100', '100', '10000000', '90000000');
  console.log('price >>> - ', price)
  expect(price).not.toBe('0');
});
