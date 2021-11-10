import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getAccountKeyring } from '../../utils';

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

      if (!api)
        reject({
          section: 'lbp.createPoolLbpSudo',
          data: ['API is not available'],
        });

      let defaultSigner = await getAccountKeyring('//Alice');

      const currentSigner = signer ? signer : defaultSigner;

      const unsub = !isSudo
        ? await api.tx.lbp
            .createPool(
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
            )
            .signAndSend(
              currentSigner as AddressOrPair,
              ({ events = [], status }) => {
                if (status.isFinalized) {
                  let newPoolAccount: AddressOrPair | null = null;
                  events.forEach(
                    ({ event: { data, method, section }, phase }) => {
                      console.log(
                        `\t' ${phase}: ${section}.${method}:: ${data}`
                      );
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
            .sudo(
              api.tx.lbp.createPool(
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
              )
            )
            .signAndSend(
              currentSigner as AddressOrPair,
              ({ events = [], status }) => {
                if (status.isFinalized) {
                  let newPoolAccount: AddressOrPair | null = null;
                  events.forEach(
                    ({ event: { data, method, section }, phase }) => {
                      console.log(
                        `\t' ${phase}: ${section}.${method}:: ${data}`
                      );
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
    } catch (e: any) {
      reject({
        section: 'lbp.createPoolLbpSudo',
        data: [e.message],
      });
    }
  });
}
