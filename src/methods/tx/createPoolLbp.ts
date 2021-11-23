import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getAccountKeyring } from '../../utils';
import { RegistryError } from '@polkadot/types/types/registry';
import { ApiCallError, ApiInstanceError } from '../../utils/errorHandling';

/**
 *
 * @param poolOwner
 * @param assetA
 * @param assetAAmount
 * @param assetB
 * @param assetBAmount
 * @param initialWeight
 * @param finalWeight
 * @param weightCurve
 * @param fee
 * @param feeCollector
 * @param signer
 * @param isSudo
 */
export function createPoolLbp({
  poolOwner = '',
  assetA = '',
  assetAAmount = new BigNumber(0),
  assetB = '',
  assetBAmount = new BigNumber(0),
  initialWeight = new BigNumber(0),
  finalWeight = new BigNumber(0),
  weightCurve = 'Linear',
  fee = {
    numerator: new BigNumber(0),
    denominator: new BigNumber(0),
  },
  feeCollector = '',
  signer,
  isSudo = false,
}: {
  poolOwner: AddressOrPair;
  assetA: string;
  assetAAmount: BigNumber;
  assetB: string;
  assetBAmount: BigNumber;
  initialWeight: BigNumber;
  finalWeight: BigNumber;
  weightCurve: string;
  fee: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector: AddressOrPair;
  signer?: Signer;
  isSudo?: boolean;
}): Promise<AddressOrPair | null> {
  return new Promise<AddressOrPair | null>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (!api) throw new ApiInstanceError('createPoolLbp');

      let defaultSigner = getAccountKeyring('//Alice');

      const currentSigner = signer ? signer : defaultSigner;

      const tx = api.tx.lbp.createPool(
        poolOwner,
        assetA,
        assetAAmount.toString(),
        assetB,
        assetBAmount.toString(),
        initialWeight.toString(),
        finalWeight.toString(),
        weightCurve,
        {
          numerator: fee.numerator.toString(),
          denominator: fee.denominator.toString(),
        },
        feeCollector
      );

      const unsub = !isSudo
        ? await tx.signAndSend(
            currentSigner as AddressOrPair,
            ({ events = [], status }) => {
              events.forEach(({ event: { data, method, section }, phase }) => {
                // console.log(
                //   ` status - ${status} || ${phase}: ${section}.${method}:: ${data}`
                // );

                if (method === 'ExtrinsicFailed') {
                  const [dispatchError, dispatchInfo] = data;

                  unsub();
                  throw new ApiCallError('createPoolLbp', dispatchError, api);
                }
              });
              if (status.isFinalized) {
                let newPoolAccount: AddressOrPair | null = null; // TODO update response in case pool address is not available in event response
                events.forEach(
                  ({ event: { data, method, section }, phase }) => {
                    // console.log(
                    //   `\t' ${phase}: ${section}.${method}:: ${data}`
                    // );
                    if (section === 'lbp' && method == 'PoolCreated') {
                      newPoolAccount = data[0].toString();
                    }
                  }
                );

                unsub();
                resolve(newPoolAccount);
              }
            }
          )
        : await api.tx.sudo
            .sudo(tx)
            .signAndSend(
              currentSigner as AddressOrPair,
              ({ events = [], status }) => {
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
                          throw new ApiCallError('createPoolLbp', error, api);
                        }
                      }
                    );
                }
                if (status.isFinalized) {
                  let newPoolAccount: AddressOrPair | null = null;
                  events.forEach(
                    ({ event: { data, method, section }, phase }) => {
                      if (section === 'lbp' && method == 'PoolCreated') {
                        newPoolAccount = data[0].toString();
                      }
                    }
                  );

                  unsub();
                  resolve(newPoolAccount);
                }
              }
            );
    } catch (e: any | typeof ApiCallError | typeof ApiInstanceError) {
      reject(e);
    }
  });
}
