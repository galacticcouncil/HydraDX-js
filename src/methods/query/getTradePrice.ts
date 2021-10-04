import BigNumber from 'bignumber.js';
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { wasm } from './index';

export async function getTradePrice(
  asset1Id: string,
  asset2Id: string,
  tradeAmount: BigNumber,
  actionType: string
) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (api) {
        let amount = new BigNumber(0);
        let asset1IdForCalculation = asset1Id;
        let asset2IdForCalculation = asset2Id;

        if (actionType === 'buy') {
          asset1IdForCalculation = asset2Id;
          asset2IdForCalculation = asset1Id;
        }

        if (tradeAmount) {
          const assetsAmounts = await getPoolAssetsAmounts(
            asset1IdForCalculation,
            asset2IdForCalculation
          );

          if (
            assetsAmounts === null ||
            assetsAmounts.asset1 === null ||
            assetsAmounts.asset2 === null
          )
            return;

          if (actionType === 'sell') {
            amount = new BigNumber(
              await wasm.calculate_out_given_in(
                assetsAmounts.asset1,
                assetsAmounts.asset2,
                tradeAmount.toString()
              )
            );
          } else if (actionType === 'buy') {
            amount = new BigNumber(
              await wasm.calculate_in_given_out(
                assetsAmounts.asset1,
                assetsAmounts.asset2,
                tradeAmount.toString()
              )
            );
          }
        }
        resolve(amount);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}
