import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getAccountKeyring } from '../../utils';

/**
 * Set balance for passed account. It's a SUDO action. Sudo signer account is Alice.
 *
 * @param addressForUpdate
 * @param assetId
 * @param freeBalance
 * @param reservedBalance
 */
export function setBalanceSudo(
  addressForUpdate: AddressOrPair,
  assetId: string,
  freeBalance: BigNumber,
  reservedBalance: BigNumber,
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    const api = Api.getApi();

    if (!api) reject('API is not available');

    const sudoPair = await getAccountKeyring('//Alice');

    console.log('Sudo Balance');

    const unsub = await api.tx.sudo
      .sudo(
        api.tx.tokens.setBalance(
          addressForUpdate,
          assetId,
          freeBalance.toString(),
          reservedBalance.toString()
        )
      )
      .signAndSend(
        sudoPair as AddressOrPair,
        ({ events = [], status }) => {
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
          });

          if (status.isFinalized) {
            events.forEach(({ event: { data, method, section }, phase }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
            });

            unsub();
            resolve();
          }
        }
      );
  });
}
