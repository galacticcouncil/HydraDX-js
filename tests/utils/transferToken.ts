import BigNumber from 'bignumber.js';
import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';

export const transferToken = (api: HydraApiPromise, targetAddress: string, sourceKeyring: KeyringPair, assetId: string, amount: BigNumber) => {
  return new Promise<void>(async (resolve, reject) => {
    const unsub = await api.tx.tokens
      .transfer(targetAddress, assetId, amount.toString())
      .signAndSend(sourceKeyring, async ({ events = [], status }) => {
        // events.forEach(({ event: { data, method, section }, phase }) => {
        //   console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
        // });
        if (status.isFinalized) {
          unsub();
          resolve();
        }
    });
  });
}