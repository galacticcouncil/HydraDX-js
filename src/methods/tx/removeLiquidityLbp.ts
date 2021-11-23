import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';
import { getAccountKeyring, getSudoPair } from '../../utils';

export function removeLiquidityLbp({
  poolId,
}: {
  poolId: string,
}): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      const sudoPair = await getAccountKeyring('//Alice');
      // const sudoPair = await getSudoPair();
      const unsub = await api.tx.sudo
        .sudo(
          api.tx.lbp.removeLiquidity(
            poolId,
          )
        )
        .signAndSend(
          // @ts-ignore
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
    } catch (e: any) {
      reject({
        section: 'lbp.removeLiquidity',
        data: [e.message],
      });
    }
  });
}
