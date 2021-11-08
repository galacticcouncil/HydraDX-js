import BigNumber from 'bignumber.js';
import { AddressOrPair, Signer } from '@polkadot/api/types';
import {
  toInternalBN,
  toExternalBN,
  decorateExchangeTxDataToExternalBN,
} from '../../utils';

import { createPoolLbpSudo as _createPoolLbpSudo } from './createPoolLbpSudo';
import { updatePoolDataLbpSudo as _updatePoolDataLbpSudo } from './updatePoolDataLbpSudo';
import { setBalanceSudo as _setBalanceSudo } from './setBalanceSudo';
import { addLiquidityLbpSudo as _addLiquidityLbpSudo } from './addLiquidityLbpSudo';
import { removeLiquidityLbpSudo as _removeLiquidityLbpSudo } from './removeLiquidityLbpSudo';
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
  reservedBalance: BigNumber
) => {
  return _setBalanceSudo(
    addressForUpdate,
    assetId,
    toInternalBN(freeBalance),
    toInternalBN(reservedBalance)
  );
};

const createPoolLbpSudo = ({
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
}) => {
  return _createPoolLbpSudo({
    poolOwner,
    assetA,
    assetAAmount: toInternalBN(assetAAmount),
    assetB,
    assetBAmount: toInternalBN(assetBAmount),
    initialWeight: toInternalBN(initialWeight),
    finalWeight: toInternalBN(finalWeight),
    weightCurve,
    fee: {
      numerator: toInternalBN(fee.numerator),
      denominator: toInternalBN(fee.denominator),
    },
    feeCollector,
  });
};

const updatePoolDataLbpSudo = ({
  poolId,
  poolOwner,
  start,
  end,
  initialWeight,
  finalWeight,
  fee,
  feeCollector,
}: {
  poolId: AddressOrPair;
  poolOwner?: AddressOrPair;
  start?: BigNumber;
  end?: BigNumber;
  initialWeight?: BigNumber;
  finalWeight?: BigNumber;
  fee?: {
    numerator: BigNumber;
    denominator: BigNumber;
  };
  feeCollector?: AddressOrPair;
}) => {
  return _updatePoolDataLbpSudo({
    poolId,
    poolOwner,
    start: start ? toInternalBN(start) : start,
    end: end ? toInternalBN(end) : end,
    initialWeight: initialWeight ? toInternalBN(initialWeight) : initialWeight,
    finalWeight: finalWeight ? toInternalBN(finalWeight) : finalWeight,
    fee: fee
      ? {
          numerator: toInternalBN(fee.numerator),
          denominator: toInternalBN(fee.denominator),
        }
      : fee,
    feeCollector,
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

const addLiquidityLbpSudo = (
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber,
  maxSellPrice: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _addLiquidityLbpSudo(
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

const removeLiquidityLbpSudo = (
  asset1Id: string,
  asset2Id: string,
  liquidityToRemove: BigNumber,
  account: AddressOrPair,
  signer?: Signer
) => {
  return _removeLiquidityLbpSudo(
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

  // Sudo transactions
  createPoolLbpSudo,
  updatePoolDataLbpSudo,
  setBalanceSudo,
  addLiquidityLbpSudo,
  removeLiquidityLbpSudo,
  swapLbp,
};
