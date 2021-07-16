import { bnToBn } from '@polkadot/util';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec, AnyJson } from '@polkadot/types/types';
import {
  ExchangeTxEventData,
  MergedPairedEvents,
  TokenTradeMap,
} from '../types';

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

export const getAssetPrices = (
  tokenTradeMap: any,
  parsedPoolsList: AnyJson[][],
  poolAssetAmounts: any[]
): {
  [key: string]: BigNumber;
} => {
  const priceUnit = new BigNumber(1).multipliedBy('1e12');
  const stableCoinId = getStableCoinID();
  const tradeMap = { ...tokenTradeMap };
  const assetPrices: any = {
    [stableCoinId]: priceUnit,
  };
  const activeMap = [
    {
      [stableCoinId]: tradeMap[stableCoinId],
    },
  ];

  while (activeMap.length) {
    const element: any = activeMap.pop();

    if (element) {
      const key: string = Object.keys(element)[0];

      tradeMap[key] = null;
      for (let i = 0; i < element[key].length; i++) {
        const assetId = element[key][i].toString();

        if (tradeMap[assetId]) {
          activeMap.push({
            [assetId]: tradeMap[assetId],
          });
        }

        const currentPool: any = parsedPoolsList.find(
          poolInfo =>
            poolInfo[1] &&
            //@ts-ignore
            poolInfo[1].includes(key) &&
            //@ts-ignore
            poolInfo[1].includes(assetId)
        );

        const poolHash = currentPool && currentPool[0] && currentPool[0][0];
        const assetAmount = poolAssetAmounts.find(
          amount => amount.accountAddress === poolHash
        );
        const assetIndex =
          currentPool &&
          currentPool[1] &&
          (currentPool[1] as any[]).indexOf(assetId);
        let price;

        if (assetIndex === 0) {
          price = assetPrices[key]
            .multipliedBy(assetAmount.spotPrice)
            .dividedBy(priceUnit);
        } else {
          price = assetPrices[key]
            .dividedBy(assetAmount.spotPrice)
            .multipliedBy(priceUnit);
        }

        assetPrices[assetId] = price;
      }
    }
  }

  return assetPrices;
};

export { decToBn, bnToDec, getStableCoinID };
