import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';

export function mintAsset(account: AddressOrPair, signer?: Signer) {
  const api = Api.getApi();
  const tx = api.tx.faucet.mint();
  let result: any;
  
  return new Promise((resolve, reject) => {
    if (signer) {
      result = tx.signAndSend(account, { signer }, txCallback(resolve, reject));
    } else {
      result = tx.signAndSend(account, txCallback(resolve, reject));
    }

    result.catch(txCatch(reject));
  });
};
