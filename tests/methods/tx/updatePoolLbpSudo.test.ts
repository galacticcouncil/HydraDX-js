import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';
import { getAliceAccount } from '../../utils/getAliceAccount';

test('Test updatePoolDataLbp query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();

  const currentPool = await api.basilisk.query.getPoolInfoLbp({
    asset0Id: '0',
    asset1Id: '1',
  });

  console.log('>>>currentPool - ', currentPool);

  if (!currentPool) return;

  await api.basilisk.tx.updatePoolDataLbp({
    poolId: currentPool.poolId!,
    start: new BigNumber(4000),
    end: new BigNumber(5000),
  });

  // expect(isBalanceChanged).toBe(true);
});
