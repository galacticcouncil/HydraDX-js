import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { getAllPoolInfo } from './getAllPoolInfo';
import { removeLiquidity } from './removeLiquidity';

export const destroyAllPools = async (api: HydraApiPromise, account: KeyringPair) => {
  let pools = await getAllPoolInfo(api);

  for (let i = 0; i < pools.length; i++) {
    await removeLiquidity(api, account, pools[i].asset1Id, pools[i].asset2Id, pools[i].asset1Amount);
  }

  return Promise.resolve();
}
