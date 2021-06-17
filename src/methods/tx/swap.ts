import Api from '../../api';
import { bnToBn } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import { txCallback, txCatch } from './_callback';
import { ExchangeTxEventData } from '../../types';

export function swap({
  asset1Id,
  asset2Id,
  amount,
  expectedOut,
  actionType,
  slippage,
  account,
  signer,
}: {
  asset1Id: string;
  asset2Id: string;
  amount: BigNumber;
  expectedOut: string;
  actionType: string;
  slippage: BigNumber;
  account: AddressOrPair;
  signer?: Signer;
}) {
  const api = Api.getApi();
  let tx: any;
  let result: any;

  /**
   * This wrapper for "signAndSend" callback is necessary for running "txCallback"
   * only if events status is InBlock. Otherwise, "txCallback" won't receive
   * events list as it will be still empty.
   */
  const exchangeSignAndSendCallback = (resolve: any, reject: any) => (
    callbackData: any
  ) => {
    const { status } = callbackData;
    if (status.isInBlock) txCallback(resolve, reject, 'exchange')(callbackData);
  };

  if (actionType === 'buy') {
    tx = api.tx.exchange
      //TODO: CALCULATE LIMITS FROM SPOT PRICE
      .buy(
        asset1Id,
        asset2Id,
        bnToBn(amount.toString()),
        bnToBn(slippage.toString()),
        false
      );
  } else {
    tx = api.tx.exchange
      //TODO: CALCULATE LIMITS FROM SPOT PRICE
      .sell(
        asset1Id,
        asset2Id,
        bnToBn(amount.toString()),
        bnToBn(slippage.toString()),
        false
      );
  }

  return new Promise<ExchangeTxEventData>((resolve, reject) => {
    if (signer) {
      result = tx.signAndSend(
        account,
        { signer },
        exchangeSignAndSendCallback(resolve, reject)
      );
    } else {
      result = tx.signAndSend(
        account,
        exchangeSignAndSendCallback(resolve, reject)
      );
    }

    result.catch(txCatch(reject));
  });
}
