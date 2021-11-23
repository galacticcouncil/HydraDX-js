import BigNumber from 'bignumber.js';
import { bnToDec } from '../../utils';
import Api from '../../api';
import { AccountAmount } from './index';
import { ApiInstanceError } from '../../utils/errorHandling';

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
  type: string, // TODO add enum typing
  blockHash?: string
): Promise<BigNumber> => {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) throw new ApiInstanceError('getSpotPriceLbp');

      if (assetId === '0') {
        const amountData = blockHash
          ? await api.query.system.account.at(blockHash, accountId)
          : await api.query.system.account(accountId);

        // @ts-ignore
        resolve(bnToDec(amountData.data[type]));
      } else {
        const amount: AccountAmount = blockHash
          ? await api.query.tokens.accounts.at(blockHash, accountId, assetId)
          : await api.query.tokens.accounts(accountId, assetId);

        // @ts-ignore
        resolve(amount[type] ? bnToDec(amount[type]) : null);
      }
    } catch (e) {
      reject(e);
    }
  });
};
