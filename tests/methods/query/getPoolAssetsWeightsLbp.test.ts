import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
import BigNumber from 'bignumber.js';
let api: HydraApiPromise;

test('Test getPoolAssetsWeightsLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const weightsScope = await api.basilisk.query.getPoolAssetsWeightsLbp(
    new BigNumber(10),
    new BigNumber(10000),
    new BigNumber('10000000'),
    new BigNumber('90000000'),
    new BigNumber(113)
  );

  expect(weightsScope).not.toBe(null);
  console.log('weightsScope asset0Weight >>> - ', weightsScope.asset0Weight.toString());
  console.log('weightsScope asset1Weight >>> - ', weightsScope.asset1Weight.toString());
});
