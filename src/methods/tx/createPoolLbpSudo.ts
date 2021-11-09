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
 */
export function createPoolLbpSudo({
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
}): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (!api)
        reject({
          section: 'lbp.createPoolLbpSudo',
          data: ['API is not available'],
        });

      const sudoPair = await getAccountKeyring('//Alice');

      const unsub = await api.tx.sudo
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
        .signAndSend(sudoPair as AddressOrPair, ({ events = [], status }) => {
          if (status.isFinalized) {
            events.forEach(({ event: { data, method, section }, phase }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
            });

            unsub();
            resolve();
          }
        });
    } catch (e: any) {
      reject({
        section: 'lbp.createPoolLbpSudo',
        data: [e.message],
      });
    }
  });
}
