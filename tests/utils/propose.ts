import BigNumber from 'bignumber.js';
import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';

export const propose = (api: HydraApiPromise, sourceKeyring: KeyringPair, hash: string, amount: BigNumber) => {
  return new Promise<void>(async (resolve, reject) => {
    const unsub = await api.tx.democracy
      .propose(hash, amount.toString())
      .signAndSend(sourceKeyring, async ({ events = [], status }) => {
        if (status.isFinalized) {
          // events.forEach(({ event: { data, method, section }, phase }) => {
          //   console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
          // });

          unsub();
          resolve();
        }
    });
  });
}