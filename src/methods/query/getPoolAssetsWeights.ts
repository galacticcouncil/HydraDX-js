import BigNumber from 'bignumber.js';
import { wasm } from './index';

/**
 * getPoolAssetsWeightsLbp provides weights for assetA and assetB.
 *
 * When "saleStart" and "saleEnd" are "0" it means that pool still is not updated
 * and we should use "poolInitialWeight" as weight for asset0.
 *
 * @param saleStart
 * @param saleEnd
 * @param poolInitialWeight
 * @param poolFinalWeight
 * @param relayChainBlockHeight
 */
export const getPoolAssetsWeightsLbp = async (
  saleStart: BigNumber,
  saleEnd: BigNumber,
  poolInitialWeight: BigNumber,
  poolFinalWeight: BigNumber,
  relayChainBlockHeight: BigNumber
): Promise<{
  asset0Weight: BigNumber;
  asset1Weight: BigNumber;
}> => {

  let asset0Weight = poolInitialWeight;
  // "100000000" is a maximum weight value
  let asset1Weight = new BigNumber('100000000').minus(poolInitialWeight);

  if (!saleStart.isZero() && !saleEnd.isZero()) {
    asset0Weight = new BigNumber(
      wasm.lbp.calculate_linear_weights(
        saleStart.toString(),
        saleEnd.toString(),
        poolInitialWeight.toString(), // initial weight A
        poolFinalWeight.toString(), // final weight A
        relayChainBlockHeight.toString()
      )
    );

    asset1Weight = new BigNumber('100000000').minus(asset0Weight);
  }

  return {
    asset0Weight,
    asset1Weight,
  };
};
