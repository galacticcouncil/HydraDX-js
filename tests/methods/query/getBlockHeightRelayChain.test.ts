import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
import BigNumber from 'bignumber.js';
let api: HydraApiPromise;

test('Test getBlockHeightRelayChain query', async () => {

  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  // const chainInfo = await api.registry.getChainProperties();
  //
  // console.log('>>> chainInfo - ', chainInfo!.toHuman());

  const blockHeight = await api.basilisk.query.getBlockHeightRelayChain();

  expect(blockHeight).not.toBe(null);
  console.log(
    'blockHeight >>> - ',
    blockHeight ? blockHeight.toString() : blockHeight
  );
});
