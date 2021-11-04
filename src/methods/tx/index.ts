import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import {
  toInternalBN,
  toExternalBN,
  decorateExchangeTxDataToExternalBN,
} from '../../utils';

import { createPool as _createPool } from './createPool';
import { addLiquidity as _addLiquidity } from './addLiquidity';
import { removeLiquidity as _removeLiquidity } from './removeLiquidity';
import { mintAsset } from './mintAsset';
import { swap as _swap } from './swap';
import { processChainEvent } from './_events';
import { getAccountBalances as _getAccountBalances } from '../query/getAccountBalances';
import { AssetBalance } from '../../types';
import { ExchangeTxEventData } from '../../types';

const createPool = (
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber,
  initialPrice: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _createPool(
    asset1Id,
    asset2Id,
    toInternalBN(amount),
    toInternalBN(initialPrice, 18),
    account,
    signer
  );
};

const addLiquidity = (
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber,
  maxSellPrice: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _addLiquidity(
    asset1Id,
    asset2Id,
    toInternalBN(amount),
    toInternalBN(maxSellPrice),
    account,
    signer
  );
};

const removeLiquidity = (
  asset1Id: string,
  asset2Id: string,
  liquidityToRemove: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _removeLiquidity(
    asset1Id,
    asset2Id,
    toInternalBN(liquidityToRemove),
    account,
    signer
  );
};

const swap = ({
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
}) => {
  return new Promise((resolve, reject) => {
    _swap({
      asset1Id,
      asset2Id,
      amount: toInternalBN(amount),
      expectedOut,
      actionType,
      slippage: toInternalBN(slippage),
      account,
      signer,
    })
      .then((txData: ExchangeTxEventData) => {
        resolve(decorateExchangeTxDataToExternalBN(txData));
      })
      .catch(txErrorData => reject(txErrorData));
  });
};

export default {
  createPool,
  addLiquidity,
  removeLiquidity,
  mintAsset,
  swap,
  processChainEvent,
};
