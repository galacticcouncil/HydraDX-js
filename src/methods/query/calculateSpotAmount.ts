import BigNumber from 'bignumber.js';
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';

import wasmUtils from '../../utils/wasmUtils';

/**
 * @deprecated The method should not be used and removed as redundant
 */
export async function calculateSpotAmount(
  asset1Id: string,
  asset2Id: string,
  amount: BigNumber
) {
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

        const price = new BigNumber(
          wasmUtils.xyk.getSpotPrice(
            assetsAmounts.asset1,
            assetsAmounts.asset2
            // amount.toString() // TODO this parameter cannot be passed
          )
        );
        resolve(price);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}
