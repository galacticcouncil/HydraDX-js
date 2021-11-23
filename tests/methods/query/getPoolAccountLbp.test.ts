import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test getPoolAccountLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const account = await api.basilisk.query.getPoolAccountLbp('0', '1');
  console.log('account >>> - ', account);
  expect(account).not.toBe(null);
});
