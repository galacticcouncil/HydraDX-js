import BigNumber from 'bignumber.js';
import type {
  AccountInfoWithProviders,
  AccountInfoWithRefCount,
} from '@polkadot/types/interfaces';
import { AssetBalance } from '../../types';
import Api from '../../api';

export async function getAccountBalances(account: any) {
  return new Promise<AssetBalance[]>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      const balances: AssetBalance[] = [];

      if (account && api) {
        const multiTokenInfo = await api.query.tokens.accounts.entries(account);
        const baseTokenInfo = (await api.query.system.account(account)) as
          | AccountInfoWithProviders
          | AccountInfoWithRefCount;
        const baseTokenBalance = new BigNumber(
          baseTokenInfo.data.free.toString()
        );
        const feeFrozenBalance = new BigNumber(
          baseTokenInfo.data.feeFrozen.toString()
        );
        const miscFrozenBalance = new BigNumber(
          baseTokenInfo.data.miscFrozen.toString()
        );
        const reservedBalance = new BigNumber(
          baseTokenInfo.data.reserved.toString()
        );

        balances[0] = {
          assetId: 0,
          balance: baseTokenBalance,
          totalBalance: baseTokenBalance
            .plus(feeFrozenBalance)
            .plus(miscFrozenBalance)
            .plus(reservedBalance),
          freeBalance: baseTokenBalance,
          feeFrozenBalance,
          miscFrozenBalance,
          reservedBalance,
        };
        multiTokenInfo.forEach(record => {
          let assetId = 99999;

          const assetInfo = record[0].toHuman();
          if (Array.isArray(assetInfo) && typeof assetInfo[1] === 'string') {
            assetId = parseInt(assetInfo[1]);
          }

          const assetBalances = api.createType('AccountData', record[1]);
          const balance = new BigNumber(assetBalances.free.toString());
          const feeFrozenBalance = new BigNumber(
            assetBalances.feeFrozen.toString()
          );
          const miscFrozenBalance = new BigNumber(
            assetBalances.miscFrozen.toString()
          );
          const reservedBalance = new BigNumber(
            assetBalances.reserved.toString()
          );
          const totalBalance = balance
            .plus(feeFrozenBalance)
            .plus(miscFrozenBalance)
            .plus(reservedBalance);

          balances[assetId] = {
            assetId,
            balance,
            totalBalance,
            freeBalance: balance,
            feeFrozenBalance,
            miscFrozenBalance,
            reservedBalance,
          };
        });
      }

      resolve(balances);
    } catch (e: any) {
      reject(e);
    }
  });
}
