import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';

export function addLiquidity(asset1Id: string, asset2Id: string, amount: BigNumber, maxSellPrice: BigNumber, account: AddressOrPair, signer?: Signer) {
  return new Promise((resolve, reject) => {
    try {
      const api = Api.getApi();
      const tx = api.tx.xyk.addLiquidity(
                              asset1Id,
                              asset2Id,
                              bnToBn(amount.toString()),
                              bnToBn(maxSellPrice.toString())
                            );
      let result: any;
    
      if (signer) {
        result = tx.signAndSend(account, { signer }, txCallback(resolve, reject));
      } else {
        result = tx.signAndSend(account, txCallback(resolve, reject));
      }

      result.catch(txCatch(reject));
    } catch (e) {
      reject({
        section: 'xyk.addLiquidity',
        data: [ e.message ],
      });
    }
  });
};
