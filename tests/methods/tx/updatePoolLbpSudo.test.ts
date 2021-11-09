import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;
import BigNumber from 'bignumber.js';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { getFormattedAddress, toExternalBN } from '../../../src/utils';
import { getPoolInfoLbp } from '../../../src/methods/query/getPoolInfo';

test('Test updatePoolLbpSudo query', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const alice = getAliceAccount();

  const aliceAddress = await getFormattedAddress(alice.address);

  const currentPool = await getPoolInfoLbp({
    asset0Id: '0',
    asset1Id: '1',
  });

  console.log('>>>currentPool - ', currentPool)

  if (!currentPool) return;

  await api.basilisk.tx.updatePoolDataLbpSudo({
    poolId: currentPool.poolId!,
    start: new BigNumber(20),
    end: new BigNumber(1000),
  });

  // expect(isBalanceChanged).toBe(true);
});
