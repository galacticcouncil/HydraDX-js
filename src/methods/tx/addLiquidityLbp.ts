import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';
import { getAccountKeyring, getSudoPair } from '../../utils';

export function addLiquidityLbp({
  asset1Id,
  asset2Id,
  amount,
  maxSellPrice,
  account,
  signer,
  isSudo
} : {
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber,
  maxSellPrice: BigNumber,
  account: AddressOrPair,
  signer?: Signer,
  isSudo?: boolean,
}): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      const defaultSigner = getAccountKeyring('//Alice');
      const currentSigner = signer || defaultSigner;
      let tx = api.tx.lbp.addLiquidity(
        asset1Id,
        asset2Id,
        bnToBn(amount.toString()),
        bnToBn(maxSellPrice.toString())
      );
      let result: any;

      if (isSudo) {
        result = api.tx.sudo.sudo(tx).signAndSend(
          // @ts-ignore
          currentSigner?.address as AddressOrPair,
          txCallback(resolve, reject),
        )
      } else {
        result = tx.signAndSend(
          account,
          { signer },
          txCallback(resolve, reject)
        )
      }

      result.catch(txCatch(reject));
    } catch (e: any) {
      reject({
        section: 'lbp.addLiquidity',
        data: [e.message],
      });
    }
  });
}
