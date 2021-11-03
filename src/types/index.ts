import BigNumber from 'bignumber.js';
import { ApiPromise } from '@polkadot/api';
import { AddressOrPair } from '@polkadot/api/types';
import type { Codec, AnyJson } from '@polkadot/types/types';

import {
  getSpotPriceXyk,
  calculateInGivenOutXyk,
  calculateOutGivenInXyk,
  getSpotPriceLbp,
  calculateInGivenOutLbp,
  calculateOutGivenInLbp,
  calculateLinearWeightsLbp,
} from '../utils/wasmUtils';

export const ChainName = {
  hydraDx: 'hydraDx',
  basilisk: 'basilisk',
} as const;

export interface HydraApiPromise extends ApiPromise {
  hydraDx?: any;
  basilisk?: any;
  wasmUtils: {
    xyk: {
      getSpotPrice: typeof getSpotPriceXyk;
      calculateOutGivenIn: typeof calculateOutGivenInXyk;
      calculateInGivenOut: typeof calculateInGivenOutXyk;
    };
    lbp: {
      getSpotPrice: typeof getSpotPriceLbp;
      calculateOutGivenIn: typeof calculateOutGivenInLbp;
      calculateInGivenOut: typeof calculateInGivenOutLbp;
      calculateLinearWeights: typeof calculateLinearWeightsLbp;
    };
  };
}

export type ApiListeners = {
  error?: (e: Error) => void;
  connected?: (api?: ApiPromise) => void;
  disconnected?: () => void;
  ready?: (api?: ApiPromise) => void;
  onTxEvent?: (eventData: any) => void;
};

export type AssetAmount = {
  amount: BigNumber;
  inputAmount: number;
  amountFormatted: string;
};

export type AssetBalance = {
  assetId: number;
  balance: BigNumber;
  totalBalance: BigNumber;
  freeBalance: BigNumber;
  feeFrozenBalance: BigNumber;
  miscFrozenBalance: BigNumber;
  reservedBalance: BigNumber;
  name?: string;
  shareToken?: boolean;
};

export type AssetRecord = {
  assetId: number;
  name: string;
  icon?: string;
};

export type PoolInfo = {
  [key: string]: {
    poolAssets: number[];
    poolAssetNames: string[];
    shareToken: number;
    poolAssetsAmount?: {
      asset1: BigNumber | null;
      asset1Weight?: BigNumber | null; // actual for Basilisk chain
      asset2: BigNumber | null;
      asset2Weight?: BigNumber | null; // actual for Basilisk chain
    } | null;
    marketCap?: BigNumber;
  };
};

export type TokenTradeMap = { [key: number]: number[] };

export type ChainBlockEventsCallback = (data: MergedPairedEvents) => void;

export type TradeTransaction = {
  index: number;
  accountId: AddressOrPair;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  expectedOut: string;
  type: string;
  slippage: BigNumber;
  progress: number;
};

export type DirectTradeFee = {
  account1: string;
  account2: string;
  asset: string;
  amount: BigNumber;
};

export type ExchangeTransactionDetails = {
  id: string | null;
  slippage?: BigNumber;
  fees?: DirectTradeFee[];
  totalFeeFinal?: BigNumber;
  match?: BigNumber;
  totalDirectTradeExchanged?: BigNumber;
  saved?: BigNumber;
  intentionType?: string;
  account?: string;
  asset1?: string;
  asset2?: string;
  amount?: BigNumber;
  amountXykTrade?: BigNumber;
  amountOutXykTrade?: BigNumber;
  amountSoldBought?: BigNumber;
  totalAmountFinal?: BigNumber;
  errorDetails?:
    | string
    | { section: string; name: string; documentation: string };
  assetsPair?: string;
  directTrades?: {
    amountSent: BigNumber;
    amountReceived: BigNumber;
    account1: string;
    account2: string;
    pairedIntention: string;
  }[];
};

export type ExchangeTxEventData = {
  section: string[];
  method: string[];
  dispatchInfo: string[];
  status: {
    ready: boolean;
    inBlock: boolean;
    finalized: boolean;
    error: { method: string; data: any }[];
  };
  data: ExchangeTransactionDetails;
};

export type MergedPairedEvents = { [key: string]: ExchangeTxEventData };

export type LbpPoolDataHuman = {
  owner: string;
  start: string;
  end: string;
  assets: string[];
  initialWeight: string;
  finalWeight: string;
  weightCurve: string;
  fee: { numerator: string; denominator: string };
  feeCollector: string;
  [index: string]: AnyJson;
};

export type LbpPoolData = {
  poolId: string;
  saleStart: BigNumber;
  saleEnd: BigNumber;
  owner: string;
  initialWeight: BigNumber;
  finalWeight: BigNumber;
  asset0Id: string;
  asset1Id: string;
  weightCurve: string;
  feeNumerator: string;
  feeDenominator: string;
  feeCollector: string;
};

export type RelayChainValidationDataHuman = {
  parentHead: string;
  relayParentNumber: string;
  relayParentStorageRoot: string;
  maxPovSize: string;
  [index: string]: AnyJson;
};
