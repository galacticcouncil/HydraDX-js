import BigNumber from 'bignumber.js';
import { bnToDec } from '../../utils';
import Api from '../../api';
import { AccountAmount } from './index';

/**
 * getTokenAmount returns tokens amount for provided account (pool, wallet)
 * @param accountId: string
 * @param assetId: string
 * @param type
 * @param blockHash
 */
export const getTokenAmount = async (
  accountId: string,
  assetId: string,
  type: string,
  blockHash?: string | undefined
): Promise<BigNumber | null> => {
  const api = Api.getApi();
  if (!api) return null;

  if (assetId === '0') {
    const amountData = blockHash
      ? await api.query.system.account.at(blockHash, accountId)
      : await api.query.system.account(accountId);

    // @ts-ignore
    return bnToDec(amountData.data[type]);
  } else {
    try {
      const amount: AccountAmount = blockHash
        ? await api.query.tokens.accounts.at(blockHash, accountId, assetId)
        : await api.query.tokens.accounts(accountId, assetId);

      // @ts-ignore
      return amount[type] ? bnToDec(amount[type]) : null;
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }
};
