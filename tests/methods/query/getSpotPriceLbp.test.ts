import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test getSpotPriceLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const price = await api.basilisk.query.getSpotPriceLbp('0', '3');
  console.log('price >>> - ', price)
  expect(price).not.toBe('0');
});
