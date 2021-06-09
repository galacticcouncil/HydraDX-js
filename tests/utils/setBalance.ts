import BigNumber from 'bignumber.js';
import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';

export const setBalance = (api: HydraApiPromise, sourceKeyring: KeyringPair, freeAmount: BigNumber, reservedAmount: BigNumber) => {
  return new Promise<void>(async (resolve, reject) => {
    const unsub = await api.tx.balances
      .setBalance(sourceKeyring.address, freeAmount.toString(), reservedAmount.toString())
      .signAndSend(sourceKeyring, async ({ events = [], status }) => {
        if (status.isFinalized) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
          });

          unsub();
          resolve();
        }
    });
  });
}