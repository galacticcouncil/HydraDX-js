import { bnToBn } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { KeyringPair } from '@polkadot/keyring/types';
import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec, AnyJson } from '@polkadot/types/types';
import {
  ExchangeTxEventData,
  MergedPairedEvents,
  TokenTradeMap,
} from '../types';

import Api from '../api';
import { Keyring } from '@polkadot/api';

/**
 * Convert BigNumber value to BN
 * @param bignumber
 */
const decToBn = (bignumber: BigNumber): BN => bnToBn(bignumber.toString());

/**
 * Convert BN value to BigNumber
 * @param bn
 */
const bnToDec = (bn: BN): BigNumber => new BigNumber(bn.toString());

const getStableCoinID = () => 1;

/**
 * Convert BigNumber value from value with decimal part to 1e+n format.
 * @param number
 * @param multiply
 */
export const toInternalBN = (number: BigNumber, multiply: number = 12) =>
  number.multipliedBy(`1e+${multiply}`).integerValue();

/**
 * Convert BigNumber value from 1e+n format to value with decimal part.
 * @param number
 * @param divide
 */
export const toExternalBN = (
  number: BigNumber | null,
  divide: number = 12
): BigNumber | null =>
  number ? number.integerValue().dividedBy(`1e+${divide}`) : number;

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

/**
 * Returns formatted address regarding provided ss58Format value. If ss58Format
 * is not provided, value will be fetched from initiated in current api instance
 * chain (api.registry.getChainProperties())
 *
 * @param address
 * @param format
 * @return string | null - function returns null in case api call has been
 * required but has got failed.
 */
export const getFormattedAddress = async (
  address: string,
  format?: number
): Promise<string | null> => {
  let chainFormat = format;

  if (format === undefined) {
    const api = Api.getApi();

    if (!api) return null;

    const chainInfo = await api.registry.getChainProperties();
    if (!chainInfo) return null;
    chainFormat = +chainInfo.ss58Format.toString();
  }

  return encodeAddress(address, chainFormat);
};

/**
 * Set delay for specified number of blocks. As successful result returns
 * blockHeight of latest finalized block, which has been omitted.
 *
 * @param delayBlocksNumber
 */
export const setBlocksDelay = (
  delayBlocksNumber: number | BigNumber
): Promise<BigNumber | null> => {
  return new Promise(async resolve => {
    const api = Api.getApi();
    if (!api) {
      resolve(null);
      return;
    }

    let blockIndex = !BigNumber.isBigNumber(delayBlocksNumber)
      ? new BigNumber(delayBlocksNumber)
      : delayBlocksNumber;

    const unsubscribe = await api.rpc.chain.subscribeNewHeads(header => {
      blockIndex = blockIndex.minus(1);
      if (blockIndex.isZero()) {
        unsubscribe();
        resolve(new BigNumber(header.number.toString().replace(/,/g, '')));
        return;
      }
    });
  });
};

/**
 * Provides sudo pair for sudo transactions. By default pair is generated for
 * default sudo account Alice.
 * TODO add opportunity specify account and FIX "Unable to retrieve keypair" error
 *
 * @param blockHash
 */
export const getSudoPair = async (
  blockHash?: string | Uint8Array
): Promise<KeyringPair | null | string> => {
  const api = Api.getApi();
  if (!api) {
    return null;
  }
  const keyring = new Keyring({ type: 'sr25519' });

  const sudoKey = blockHash
    ? await api.query.sudo.key.at(blockHash)
    : await api.query.sudo.key();

  return keyring.getPair(sudoKey);
};

/**
 * Provides sudo pair for sudo transactions. By default pair is generated for
 * default sudo account Alice.
 *
 * @param account
 */
export const getAccountKeyring = (
  account: string = '//Alice'
): KeyringPair => {
  const keyring = new Keyring({ type: 'sr25519' });
  return keyring.addFromUri(account);
};

export { decToBn, bnToDec, getStableCoinID };
