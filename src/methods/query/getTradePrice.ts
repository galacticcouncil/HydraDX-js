import BigNumber from 'bignumber.js';
import Api from '../../api';
import { getPoolAssetsAmounts } from './getPoolAssetAmounts';
import wasmUtils from '../../utils/wasmUtils';

// TODO asset1Id and asset2Id should be renamed for more accurate understanding
export async function getTradePrice(
  asset1Id: string,
  asset2Id: string,
  tradeAmount: BigNumber,
  actionType: string,
  blockHash?: string | undefined
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
            asset2IdForCalculation,
            blockHash
          );

          if (
            assetsAmounts === null ||
            assetsAmounts.asset1 === null ||
            assetsAmounts.asset2 === null
          )
            return;

          if (actionType === 'sell') {
            amount = new BigNumber(
              wasmUtils.xyk.calculateOutGivenIn(
                assetsAmounts.asset1,
                assetsAmounts.asset2,
                tradeAmount.toString()
              )
            );
          } else if (actionType === 'buy') {
            amount = new BigNumber(
              wasmUtils.xyk.calculateInGivenOut(
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

export async function getTradePriceXyk(
  asset1Id: string,
  asset2Id: string,
  tradeAmount: BigNumber,
  actionType: string,
  blockHash?: string | undefined
): Promise<BigNumber> {
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
            asset2IdForCalculation,
            blockHash
          );

          if (
            assetsAmounts === null ||
            assetsAmounts.asset1 === null ||
            assetsAmounts.asset2 === null
          )
            return;

          if (actionType === 'sell') {
            amount = new BigNumber(
              wasmUtils.xyk.calculateOutGivenIn(
                assetsAmounts.asset1,
                assetsAmounts.asset2,
                tradeAmount.toString()
              )
            );
          } else if (actionType === 'buy') {
            amount = new BigNumber(
              wasmUtils.xyk.calculateInGivenOut(
                assetsAmounts.asset1,
                assetsAmounts.asset2,
                tradeAmount.toString()
              )
            );
          }
        }
        resolve(amount);
      } else {
        throw new Error('API is not available');
      }
    } catch (e: any) {
      reject(e);
    }
  });
}
