import BigNumber from "bignumber.js";
import { bnToDec } from '../../utils';
import Api from '../../api';
import { AccountAmount } from './index';
import { StorageKey } from "@polkadot/types";

/**
 * getTokenAmount returns tokens amount for provided account (pool, wallet)
 * @param accountId: string
 * @param assetId: string
 */
export const getTokenAmount = async (
  accountId: string,
  assetId: string,
  type: string,
  blockHash?: string | Uint8Array
): Promise<BigNumber | null> => {
  const api = Api.getApi();
  if (!api) return null;
  

  if (assetId === '0') {
    // @ts-ignore
    return bnToDec((await api.query.system.account(accountId)).data[type]);
  } else {
    let amount: AccountAmount;
    try {
      amount = await api.query.tokens.accounts(
        blockHash || accountId,
        assetId
      );
      // @ts-ignore
      return amount[type] ? bnToDec(amount[type]) : null;
    } catch(e: any) {
      console.log(e);
      return null;
    }
  }
};
