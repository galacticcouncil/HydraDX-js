import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test getPoolInfoLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const pool = await api.basilisk.query.getPoolInfoLbp({
    asset0Id: '0',
    asset1Id: '1',
    // blockHash: '0x23bb8cea1625b919f3f04c948214f835c8b6bdf3e9e4c08e660f0fb47b56f05e',
  });
  console.log('pool >>> - ', pool)
  expect(pool).not.toBe(null);
});
