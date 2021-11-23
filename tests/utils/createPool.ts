import BigNumber from 'bignumber.js';
import { HydraApiPromise } from '../../src/types';
import { KeyringPair } from '@polkadot/keyring/types';

export const createPool = (api: HydraApiPromise, keyring: KeyringPair, assetId1: string, assetId2: string, amount: BigNumber, initialPrice: BigNumber) => {
  let account = '';
  let tokenId = '';

  return new Promise<{
    account: string,
    tokenId: string,
  }>(async (resolve, reject) => {
    const unsub = await api.tx.xyk.createPool(assetId1, assetId2, amount.toString(), initialPrice.toString())
      .signAndSend(keyring, ({ events = [], status }) => {
        if (status.isFinalized) {
          unsub();
          resolve({
            account,
            tokenId,
          });
        } else if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            if (section === 'system' && method === 'NewAccount') {
              account = data[0].toString();
            }

            if (section === 'tokens' && method === 'Endowed') {
              tokenId = data[0].toString();
            }

            if (section === 'balances' && method === 'Endowed') {
              account = data[0].toString();
            }
          });
        }
    });
  });
}
