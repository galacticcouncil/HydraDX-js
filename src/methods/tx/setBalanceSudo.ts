import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getSudoPair } from '../../utils';

export function setBalanceSudo(
  addressForUpdate: AddressOrPair,
  assetId: string,
  freeBalance: BigNumber,
  reservedBalance: BigNumber
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    const api = Api.getApi();

    if (!api) reject('API is not available');

    const sudoPair = await getSudoPair();

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
        sudoPair?.address as AddressOrPair,
        ({ events = [], status }) => {
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
