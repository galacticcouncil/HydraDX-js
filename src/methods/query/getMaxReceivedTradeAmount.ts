import BigNumber from 'bignumber.js';

/**
 * @param tradeAmount - expected trade amount;
 * @param slippage - percentage slippage value;
 */
export const getMaxReceivedTradeAmount = (
  tradeAmount: BigNumber,
  slippage: BigNumber
): BigNumber => {
  const maxPercentage = new BigNumber(100).plus(slippage);
  return tradeAmount.multipliedBy(maxPercentage).div(100);
};
