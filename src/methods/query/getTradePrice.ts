
import BigNumber from "bignumber.js";
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { wasm } from './index';

export async function getTradePrice(asset1Id: string, asset2Id: string, tradeAmount: BigNumber, actionType: string) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
    
      if (api) {
          // let amount = bnToBn(0);
          let amount = new BigNumber(0);
  
          if (tradeAmount) {
              const assetsAmounts = await getPoolAssetsAmounts(asset1Id, asset2Id);

              if (
                  assetsAmounts === null ||
                  assetsAmounts.asset1 === null ||
                  assetsAmounts.asset2 === null
              )
                return;

              if (actionType === 'sell') {
                  amount = new BigNumber(await wasm.get_sell_price(assetsAmounts.asset1, assetsAmounts.asset2, tradeAmount.toString()));
              } else if (actionType === 'buy') {
                  amount = new BigNumber(await wasm.get_buy_price(assetsAmounts.asset1, assetsAmounts.asset2, tradeAmount.toString()));
              }
          }
          resolve(amount);
      }
    } catch(e) {
      reject(e);
    }
  });
};