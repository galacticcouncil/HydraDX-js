import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { getAccountKeyring } from '../../utils';

/**
 *
 * @param poolId
 * @param poolOwner
 * @param start - blockHeight of trading start
 * @param end - blockHeight of trading finish
 * @param initialWeight
 * @param finalWeight
 * @param fee
 * @param feeCollector
 */
export function updatePoolDataLbpSudo({
  poolId = '',
  poolOwner,
  start,
  end,
  initialWeight,
  finalWeight,
  fee,
  feeCollector,
}: {
  poolId: AddressOrPair;
  poolOwner?: AddressOrPair;
  start?: BigNumber;
  end?: BigNumber;
  initialWeight?: BigNumber;
  finalWeight?: BigNumber;
  fee?: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector?: AddressOrPair;
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
          api.tx.lbp.updatePoolData(
            (poolId = ''),
            poolOwner,
            start ? start.toString() : start,
            end ? end.toString() : end,
            initialWeight ? initialWeight.toString() : initialWeight,
            finalWeight ? finalWeight.toString() : finalWeight,
            fee
              ? {
                  numerator: fee.numerator.toString(),
                  denominator: fee.denominator.toString(),
                }
              : fee,
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
        section: 'lbp.updatePoolDataLbpSudo',
        data: [e.message],
      });
    }
  });
}
