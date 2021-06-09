import BigNumber from 'bignumber.js';
import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';

export const removeLiquidity = (api: HydraApiPromise, keyring: KeyringPair, assetId1: string, assetId2: string, amount: BigNumber) => {
  let account = '';

  return new Promise<string>(async (resolve, reject) => {
    const unsub = await api.tx.xyk.removeLiquidity(assetId1, assetId2, amount.toString())
      .signAndSend(keyring, ({ events = [], status }) => {
        if (status.isFinalized) {
          unsub();
          resolve(account);
        } else if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            if (section === 'system' && method === 'NewAccount') {
              account = data[0].toString();
            }
          });
        }
    });
  });
}
