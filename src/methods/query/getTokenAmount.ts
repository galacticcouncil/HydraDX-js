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
    let amountData = null;
    if (blockHash) {
      amountData = await api.query.system.account.at(blockHash, accountId);
    } else {
      amountData = await api.query.system.account(accountId);
    }
    // @ts-ignore
    return bnToDec(amountData.data[type]);
  } else {
    let amount: AccountAmount;
    try {
      if (blockHash) {
        amount = await api.query.tokens.accounts.at(
          blockHash,
          accountId,
          assetId
        );
      } else {
        amount = await api.query.tokens.accounts(accountId, assetId);
      }

      // @ts-ignore
      return amount[type] ? bnToDec(amount[type]) : null;
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }
};
