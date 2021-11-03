import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
import BigNumber from 'bignumber.js';
let api: HydraApiPromise;

test('Test getBlockHeightRelayChain query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const blockHeight = await api.basilisk.query.getBlockHeightRelayChain(

  );

  expect(blockHeight).not.toBe(null);
  console.log('blockHeight >>> - ', blockHeight);
});
