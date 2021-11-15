import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getAccountKeyring } from '../../utils';
import { ApiInstanceError, ApiCallError } from '../../utils/errorHandling';

/**
 * Set balance for passed account. It's a SUDO action. Sudo signer account is Alice.
 *
 * @param addressForUpdate
 * @param assetId
 * @param freeBalance
 * @param reservedBalance
 * @param signer
 */
export function setBalanceSudo(
  addressForUpdate: AddressOrPair,
  assetId: string,
  freeBalance: BigNumber,
  reservedBalance: BigNumber,
  signer?: Signer
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (!api) throw new ApiInstanceError('setBalanceSudo');

      let defaultSigner = await getAccountKeyring('//Alice');
      const currentSigner = signer ? signer : defaultSigner;

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
          currentSigner as AddressOrPair,
          ({ events = [], status }) => {
            // events.forEach(({ event: { data, method, section }, phase }) => {
            //   console.log(` status - ${status} || ${phase}: ${section}.${method}:: ${data}`);
            // });

            if (status.isInBlock || status.isFinalized) {
              events
                // We know this tx should result in `Sudid` event.
                .filter(({ event }) => api.events.sudo.Sudid.is(event))
                .forEach(
                  ({
                    event: {
                      data: [result],
                    },
                  }) => {
                    // Now we look to see if the extrinsic was actually successful or not...
                    // @ts-ignore
                    if (result.isError) {
                      // @ts-ignore
                      let error = result.asError;
                      unsub();
                      throw new ApiCallError('setBalanceSudo', error, api);
                    }
                  }
                );
            }

            if (status.isFinalized) {
              unsub();
              resolve();
            }
          }
        );
    } catch (e: any | typeof ApiCallError | typeof ApiInstanceError) {
      reject(e);
    }
  });
}
