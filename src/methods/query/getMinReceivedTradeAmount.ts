import BigNumber from 'bignumber.js';

/**
 * @param tradeAmount - expected trade amount;
 * @param slippage - percentage slippage value;
 */
export const getMinReceivedTradeAmount = (
  tradeAmount: BigNumber,
  slippage: BigNumber
): BigNumber => {
  const minPercentage = new BigNumber(100).minus(slippage);
  return tradeAmount.multipliedBy(minPercentage).div(100);
};