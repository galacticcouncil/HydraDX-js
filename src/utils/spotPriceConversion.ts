import { getSpotPriceLbp } from '../methods/query/getSpotPrice';
import config from '../config/aliasBasilisk';
import BigNumber from 'bignumber.js';

/**
 * 
 * @param assetId of the spot price in question.
 * @param poolAccountId of the LBP pool that trades with BSX.
 * @returns spot price of the asset expressed in BSX.
 */
async function spotPriceLbpInBSX(
  assetId: string,
  poolAccountId: string
): Promise<BigNumber> {
  const spotPriceInBSX = await getSpotPriceLbp(
    assetId,
    config.assets.BSX,
    poolAccountId
  );
  return spotPriceInBSX;
};

/**
 * 
 * @param assetId of the spot price in question.
 * @param poolAccountId of the LBP pool that trades with KSM.
 * @returns spot price of the asset expressed in KSM.
 */
async function spotPriceLbpInKSM(
  assetId: string,
  poolAccountId: string
): Promise<BigNumber> {
  const spotPriceInBSX = await getSpotPriceLbp(
    assetId,
    config.assets.KSM,
    poolAccountId
  );
  return spotPriceInBSX;
};

/**
 * @param assetId of the token where the spot price is asked.
 * @param poolAccountId of the LBP pool that trades with BSX.
 * @returns spot price of the assetId expressed in stable coin value.
 */
export async function bsxPairSpotPriceInStableCoin(
  assetId: string,
  poolAccountId: string
): Promise<BigNumber> {
  const assetSpotPriceInBSX = await spotPriceLbpInBSX(assetId, poolAccountId);
  const bsxSpotPriceInStableCoin = await getSpotPriceLbp(
    config.assets.BSX,
    config.assets.kUSD,
    poolAccountId
  );
  const assetSpotPriceInStableCoin = assetSpotPriceInBSX
    .multipliedBy(
        bsxSpotPriceInStableCoin
    );
  return assetSpotPriceInStableCoin;
};

/**
 *
 * @param assetId of the token where the spot price is asked.
 * @param poolAccountId of an LBP pool that trades with KSM.
 * @returns spot price of the assetId expressed in stable coin value.
 */
export async function ksmPairSpotPriceInStableCoin(
  assetId: string,
  poolAccountId: string
): Promise<BigNumber> {
  const assetSpotPriceInKSM = await spotPriceLbpInKSM(assetId, poolAccountId);
  const ksmSpotPriceInStableCoin = await getSpotPriceLbp(
    config.assets.KSM,
    config.assets.kUSD,
    poolAccountId
  );
  const assetSpotPriceInStableCoin = assetSpotPriceInKSM
    .multipliedBy(
        ksmSpotPriceInStableCoin
    );
  return assetSpotPriceInStableCoin;
};

// TODO: stableCoinToUSD(stableCoin: BigNumber) => fetch marketCap Data
// TODO: ksmToUSD(stableCoin: BigNumber) => fetch marketCap Data
