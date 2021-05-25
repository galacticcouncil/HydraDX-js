import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';

export function removeLiquidity(asset1Id: string, asset2Id: string, liquidityToRemove: BigNumber, account: AddressOrPair, signer?: Signer) {
  return new Promise((resolve, reject) => {
    try {
      const api = Api.getApi();
      const tx = api.tx.xyk.removeLiquidity(
                              asset1Id,
                              asset2Id,
                              bnToBn(liquidityToRemove.toString())
                            );
      let result: any;
    
      if (signer) {
        result = tx.signAndSend(account, { signer }, txCallback(resolve, reject));
      } else {
        result = tx.signAndSend(account, txCallback(resolve, reject));
      }

      result.catch(txCatch(reject));
    } catch(e) {
      reject({
        section: 'amm.removeLiquidity',
        data: [ e.message ],
      });
    }
  });
};
