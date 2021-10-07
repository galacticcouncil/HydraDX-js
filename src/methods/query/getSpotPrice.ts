import BigNumber from "bignumber.js";
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import { wasm } from './index';

export async function getSpotPrice(asset1Id: string, asset2Id: string) {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
    
      if (api) {
        const assetsAmounts = await getPoolAssetsAmounts(asset1Id, asset2Id);

        if (
            assetsAmounts === null ||
            assetsAmounts.asset1 === null ||
            assetsAmounts.asset2 === null
        )
          return;

        const price = new BigNumber(await wasm.xyk.get_spot_price(assetsAmounts.asset1, assetsAmounts.asset2, '1000000000000'));
        resolve(price);
      }
    } catch(e: any) {
      reject(e);
    }
  });
};
