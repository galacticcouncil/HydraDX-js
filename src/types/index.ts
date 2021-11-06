import BigNumber from 'bignumber.js';
import { ApiPromise } from '@polkadot/api';
import { AddressOrPair } from '@polkadot/api/types';

export interface HydraApiPromise extends ApiPromise {
  hydraDx?: any;
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
  freeBalance: BigNumber,
  feeFrozenBalance: BigNumber,
  miscFrozenBalance: BigNumber,
  reservedBalance: BigNumber,
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
      asset2: BigNumber | null;
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
}

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
    string | { section: string; name: string; documentation: string };
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