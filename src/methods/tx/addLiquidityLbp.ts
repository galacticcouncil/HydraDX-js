import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';
import { getAccountKeyring, getSudoPair } from '../../utils';

export function addLiquidityLbp(
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber,
  maxSellPrice: BigNumber,
  account: AddressOrPair,
  signer?: Signer
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // const sudoPair = await getSudoPair();
    const sudoPair = await getAccountKeyring('//Alice');

    try {
      const api = Api.getApi();
      const unsub = await api.tx.sudo
      .sudo(
        api.tx.lbp.addLiquidity(
          asset1Id,
          asset2Id,
          bnToBn(amount.toString()),
          bnToBn(maxSellPrice.toString())
        )
      ).signAndSend(
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
        section: 'lbp.addLiquidity',
        data: [e.message],
      });
    }
  });
}
