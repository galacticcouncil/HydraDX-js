import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import {
  toInternalBN,
  toExternalBN,
  decorateExchangeTxDataToExternalBN,
} from '../../utils';

import { createPoolLbp as _createPoolLbp } from './createPoolLbp';
import { updatePoolDataLbp } from './updatePoolDataLbp';
import { setBalanceSudo as _setBalanceSudo } from './setBalanceSudo';
import { addLiquidityLbp as _addLiquidityLbp } from './addLiquidityLbp';
import { removeLiquidityLbp as _removeLiquidityLbp } from './removeLiquidityLbp';
import { swapLbp as _swapLbp } from './swapLbp';

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

const setBalanceSudo = (
  addressForUpdate: AddressOrPair,
  assetId: string,
  freeBalance: BigNumber,
  reservedBalance: BigNumber,
  signer?: Signer
) => {
  return _setBalanceSudo(
    addressForUpdate,
    assetId,
    toInternalBN(freeBalance),
    toInternalBN(reservedBalance),
    signer
  );
};

const createPoolLbp = ({
  poolOwner,
  assetA,
  assetAAmount,
  assetB,
  assetBAmount,
  initialWeight,
  finalWeight,
  weightCurve,
  fee,
  feeCollector,
  signer,
  isSudo,
}: {
  poolOwner: AddressOrPair;
  assetA: string;
  assetAAmount: BigNumber;
  assetB: string;
  assetBAmount: BigNumber;
  initialWeight: BigNumber;
  finalWeight: BigNumber;
  weightCurve: string;
  fee: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector: AddressOrPair;
  signer?: Signer;
  isSudo?: boolean;
}) => {
  return _createPoolLbp({
    poolOwner,
    assetA,
    assetAAmount: toInternalBN(assetAAmount),
    assetB,
    assetBAmount: toInternalBN(assetBAmount),
    initialWeight: initialWeight,
    finalWeight: finalWeight,
    weightCurve,
    fee: {
      numerator: fee.numerator,
      denominator: fee.denominator,
    },
    feeCollector,
    signer,
    isSudo,
  });
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

const addLiquidityLbp = ({
  asset1Id,
  asset2Id,
  amount,
  maxSellPrice,
  account,
  signer,
  isSudo,
}: {
  asset1Id: string;
  asset2Id: string;
  amount: BigNumber;
  maxSellPrice: BigNumber;
  account: AddressOrPair;
  signer?: Signer;
  isSudo?: boolean;
}) => {
  return _addLiquidityLbp({
    asset1Id,
    asset2Id,
    amount: toInternalBN(amount),
    maxSellPrice: toInternalBN(maxSellPrice),
    account,
    signer,
    isSudo,
  });
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

const removeLiquidityLbp = (
  asset1Id: string,
  asset2Id: string,
  liquidityToRemove: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _removeLiquidityLbp(
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

const swapLbp = ({
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
    _swapLbp({
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

/**
 * If we export new method, it must be added to methods expose
 * list in "./src/utils/apiUtils.ts"
 */
export default {
  createPool,
  addLiquidity,
  removeLiquidity,
  mintAsset,
  swap,
  processChainEvent,
  updatePoolDataLbp,
  createPoolLbp,

  // Sudo transactions
  setBalanceSudo,
  addLiquidityLbp,
  removeLiquidityLbp,
  swapLbp,
};
