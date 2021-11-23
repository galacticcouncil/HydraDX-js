import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { createPool } from '../../utils/createPool';
import { getAliceAccount } from '../../utils/getAliceAccount';

test('Test getPoolAssetsAmountLbp', async () => {
  const api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const poolId = 'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS';

  const amounts = await api.basilisk.query.getPoolAssetsAmountsLbp('0', '1', poolId);

  console.log('>>>amounts - ', amounts);

  expect(amounts).toEqual({
    asset1: '1000000000',
    asset2: '0',
  });
});
