import { bnToBn } from '@polkadot/util';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import Api from '../api';

import { AssetAmount } from '../types';

const decimalPlaces = 12;

const formatBalanceAmount = (balance: BN): AssetAmount => {
  const bnDecimals = bnToBn(decimalPlaces);
  //TODO: Precision
  const baseAmount = bnToBn(10).pow(bnDecimals.sub(bnToBn(4)));
  const inputAmount = balance.div(baseAmount).toNumber() / 10 ** 4;
  return {
    amount: new BigNumber(balance.toString()),
    inputAmount: inputAmount,
    amountFormatted: formatBalance(balance),
  };
};

const decToBn = (bignumber: BigNumber): BN => bnToBn(bignumber.toString());

const bnToDec = (bn: BN): BigNumber => new BigNumber(bn.toString());

const getStableCoinID = () => 1;

export const toInternalBN = (number: BigNumber, multiply: number = 12) => number.multipliedBy(`1e${multiply}`);

export const toExternalBN = (number: BigNumber, divide: number = 12) => number.dividedBy(`1e${divide}`);

export { decToBn, bnToDec, formatBalanceAmount, getStableCoinID };
