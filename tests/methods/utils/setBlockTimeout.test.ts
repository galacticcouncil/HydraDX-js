import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';

test('Test setBlockTimeout util', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const blockHeight = await api.utils.setBlocksTimeout(new BigNumber(2));

  expect(blockHeight).not.toBe(null);
});
