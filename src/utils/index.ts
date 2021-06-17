import { bnToBn } from '@polkadot/util';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { ExchangeTxEventData, MergedPairedEvents } from '../types';

const decToBn = (bignumber: BigNumber): BN => bnToBn(bignumber.toString());

const bnToDec = (bn: BN): BigNumber => new BigNumber(bn.toString());

const getStableCoinID = () => 1;

export const toInternalBN = (number: BigNumber, multiply: number = 12) =>
  number.multipliedBy(`1e+${multiply}`).integerValue();

export const toExternalBN = (number: BigNumber, divide: number = 12) =>
  number.integerValue().dividedBy(`1e+${divide}`);

export const decorateExchangeTxDataToExternalBN = (
  txDataFull: ExchangeTxEventData
): ExchangeTxEventData => {
  let decoratedTxData = { ...txDataFull.data };

  const checkTxProperties = (propsScope: any) => {
    Object.keys(propsScope).forEach(txPropName => {
      if (Array.isArray(propsScope[txPropName])) {
        propsScope[txPropName].forEach((listedPropsScope: any) =>
          checkTxProperties(listedPropsScope)
        );
      } else if (propsScope[txPropName] instanceof BigNumber) {
        propsScope[txPropName] = toExternalBN(propsScope[txPropName]);
      }
    });
  };

  checkTxProperties(decoratedTxData);

  return {
    ...txDataFull,
    data: decoratedTxData,
  } as ExchangeTxEventData;
};

export const decorateExchangeTxDataScopeToExternalBN = (
  txDataScope: MergedPairedEvents
): MergedPairedEvents => {
  const decoratedScope: MergedPairedEvents = {};

  Object.keys(txDataScope).forEach(txId => {
    decoratedScope[txId] = decorateExchangeTxDataToExternalBN(
      txDataScope[txId]
    );
  });

  return decoratedScope;
};

export { decToBn, bnToDec, getStableCoinID };
