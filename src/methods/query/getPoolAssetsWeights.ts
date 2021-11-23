import BigNumber from 'bignumber.js';
import wasmUtils from '../../utils/wasmUtils';
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
  assetAWeight: BigNumber;
  assetBWeight: BigNumber;
}> => {

  let assetAWeight = poolInitialWeight;
  // "100000000" is a maximum weight value
  let assetBWeight = new BigNumber('100000000').minus(poolInitialWeight);

  if (!saleStart.isZero() && !saleEnd.isZero()) {
    assetAWeight = new BigNumber(
      wasmUtils.lbp.calculateLinearWeights(
        saleStart.toString(),
        saleEnd.toString(),
        poolInitialWeight.toString(), // initial weight A
        poolFinalWeight.toString(), // final weight A
        relayChainBlockHeight.toString()
      )
    );

    assetBWeight = new BigNumber('100000000').minus(assetAWeight);
  }

  return {
    assetAWeight,
    assetBWeight,
  };
};
