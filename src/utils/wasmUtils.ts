let wasm: { xyk: any; lbp: any } = { xyk: null, lbp: null };

export const initializeWasm = async () => {
  if (typeof window !== 'undefined') {
    if (typeof process.env.NODE_ENV === 'undefined') {
      wasm.xyk = await import('hydra-dx-wasm/build/xyk/web');
      wasm.xyk.default();
      wasm.lbp = await import('hydra-dx-wasm/build/lbp/web');
      wasm.lbp.default();
    } else {
      const { import_wasm } = await import('../../utils/import_wasm');
      wasm.xyk = await import_wasm.xyk();
      wasm.lbp = await import_wasm.lbp();
    }
  } else {
    wasm.xyk = await import('hydra-dx-wasm/build/xyk/nodejs');
    wasm.lbp = await import('hydra-dx-wasm/build/lbp/nodejs');
  }
};

initializeWasm();

// -----------------------------------------------------------------------------
// =============================== XYK =========================================
// -----------------------------------------------------------------------------

/**
 * Provides spot price for 1 unit of asset.
 *
 * Default asset amount for calculation is '1000000000000'
 * @param asset0Amount
 * @param asset1Amount
 */
const getSpotPriceXyk = (
  asset0Amount: string,
  asset1Amount: string
): string => {
  const unitAmount = '1000000000000';
  return wasm.xyk.get_spot_price(asset0Amount, asset1Amount, unitAmount);
};

const calculateOutGivenInXyk = (
  asset0Amount: string,
  asset1Amount: string,
  amountForCalc: string
) => {
  return wasm.xyk.calculate_out_given_in(
    asset0Amount,
    asset1Amount,
    amountForCalc
  );
};

const calculateInGivenOutXyk = (
  asset0Amount: string,
  asset1Amount: string,
  amountForCalc: string
) => {
  return wasm.xyk.calculate_in_given_out(
    asset0Amount,
    asset1Amount,
    amountForCalc
  );
};

// -----------------------------------------------------------------------------
// =============================== LBP =========================================
// -----------------------------------------------------------------------------

/**
 * Provides spot price for 1 unit of asset.
 *
 * Default asset amount for calculation is '1000000000000'
 * @param asset0Amount
 * @param asset1Amount
 * @param asset0Weight
 * @param asset1Weight
 */
const getSpotPriceLbp = (
  asset0Amount: string,
  asset1Amount: string,
  asset0Weight: string,
  asset1Weight: string
): string => {
  const unitAmount = '1000000000000';
  return wasm.lbp.get_spot_price(
    asset0Amount,
    asset1Amount,
    asset0Weight,
    asset1Weight,
    unitAmount
  );
};

const calculateOutGivenInLbp = (
  asset0Amount: string,
  asset1Amount: string,
  amountForCalc: string
) => {
  return wasm.lbp.calculate_out_given_in(
    asset0Amount,
    asset1Amount,
    amountForCalc
  );
};

const calculateInGivenOutLbp = (
  asset0Amount: string,
  asset1Amount: string,
  amountForCalc: string
) => {
  return wasm.lbp.calculate_in_given_out(
    asset0Amount,
    asset1Amount,
    amountForCalc
  );
};

/**
 * Provides asset weight in the pool in specific point of time (relayChainBlockHeight)
 *
 * @param {string} saleStart - block height of the start of pool trading
 * @param {string} saleEnd - block height of the end of pool trading
 * @param {string} initialWeight - initial weight of asset A in the pool in specific
 * point of time (relayChainBlockHeight)
 * @param {string} finalWeight - final weight of asset A in the pool in specific point
 * of time (relayChainBlockHeight)
 * @param {string} relayChainBlockHeight - block height of relay chain
 * @return {string}
 */
const calculateLinearWeightsLbp = (
  saleStart: string,
  saleEnd: string,
  initialWeight: string,
  finalWeight: string,
  relayChainBlockHeight: string
) => {
  return wasm.lbp.calculate_linear_weights(
    saleStart,
    saleEnd,
    initialWeight,
    finalWeight,
    relayChainBlockHeight
  );
};

export default {
  xyk: {
    getSpotPrice: getSpotPriceXyk,
    calculateOutGivenIn: calculateOutGivenInXyk,
    calculateInGivenOut: calculateInGivenOutXyk,
  },
  lbp: {
    getSpotPrice: getSpotPriceLbp,
    calculateOutGivenIn: calculateOutGivenInLbp,
    calculateInGivenOut: calculateInGivenOutLbp,
    calculateLinearWeights: calculateLinearWeightsLbp,
  },
};
