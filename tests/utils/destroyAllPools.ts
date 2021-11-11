import BigNumber from 'bignumber.js';

import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { getAllPoolInfo } from './getAllPoolInfo';
import { removeLiquidity } from './removeLiquidity';

export const destroyAllPools = async (api: HydraApiPromise, account: KeyringPair, moduleName: string = 'xyk') => {
  let pools = await getAllPoolInfo(api, moduleName);

  for (let i = 0; i < pools.length; i++) {
    await removeLiquidity(api, account, pools[i].asset1Id, pools[i].asset2Id, new BigNumber(pools[i].asset1Amount), moduleName);
  }

  return Promise.resolve();
}
