import { ChainName, SdkMethodsScope } from '../types';
import * as sdkUtils from '../utils';

type ChainName = typeof ChainName[keyof typeof ChainName];

const basiliskQueryMethods = [
  'getAccountBalances',
  'getAssetList',
  'getPoolInfo',
  'getPoolsInfoXyk',
  'getSpotPrice',
  'getSpotPriceXyk',
  'getSpotPriceLbp',
  'getTokenAmount',

  'getPoolAssetsAmounts',
  'getPoolAssetsAmountsLbp',

  'calculateSpotAmount',
  'getTradePrice',
  'getFreeTokenAmount',
  'getReservedTokenAmount',
  'getFrozenFeeTokenAmount',
  'getMiscFrozenTokenAmount',
  'getMarketcap',
  'getMaxReceivedTradeAmount',
  'getMinReceivedTradeAmount',

  'getBlockHeightRelayChain',
  'getPoolAssetsWeightsLbp',
];
const basiliskTxMethods = [
  'createPool',
  'addLiquidity',
  'removeLiquidity',
  'mintAsset',
  'swap',
  'processChainEvent',
  'setBalanceSudo',
  'createPoolLbpSudo',
  'updatePoolDataLbp',
  'addLiquidityLbpSudo',
  'removeLiquidityLbpSudo',
  'swapLbp',
];

const hydraDxQueryMethods = [
  'getAccountBalances',
  'getAssetList',
  'getPoolInfo',
  'getPoolsInfoXyk',
  'getSpotPrice',
  'getSpotPriceXyk',
  'getSpotPriceLbp',
  'getTokenAmount',
  'getPoolAssetsAmounts',
  'calculateSpotAmount',
  'getTradePrice',
  'getFreeTokenAmount',
  'getReservedTokenAmount',
  'getFrozenFeeTokenAmount',
  'getMiscFrozenTokenAmount',
  'getMarketcap',
  'getMaxReceivedTradeAmount',
  'getMinReceivedTradeAmount',
];
const hydraDxTxMethods = [
  'createPool',
  'addLiquidity',
  'removeLiquidity',
  'mintAsset',
  'swap',
  'processChainEvent',
  'setBalanceSudo',
];

const objectFromEntries = (object: any, [key, value]: [any, any]) => {
  return Object.assign(object, { [key]: value });
};

export const exposeApiMethods = (
  methodsScope: { query: any; tx: any },
  chainName: ChainName
): SdkMethodsScope => {
  const exposedMethods = {
    query: {},
    tx: methodsScope.tx,
  };

  const filterMethods = (methods: any, pattern: string[]) => {
    const methodsArr = Object.entries(methods);
    const filteredArr = methodsArr.filter(function ([key]) {
      return pattern.includes(key);
    });
    return filteredArr.reduce(objectFromEntries);
  };

  switch (chainName) {
    case 'basilisk':
      exposedMethods.query = filterMethods(
        methodsScope.query,
        basiliskQueryMethods
      );
      break;
    case 'hydraDx':
      exposedMethods.query = filterMethods(
        methodsScope.query,
        hydraDxQueryMethods
      );
      break;
    default:
      exposedMethods.query = methodsScope.query;
  }

  return exposedMethods as SdkMethodsScope;
};

export const exposeApiUtils = () => {
  return {
    getFormattedAddress: sdkUtils.getFormattedAddress as typeof sdkUtils.getFormattedAddress,
    setBlocksDelay: sdkUtils.setBlocksDelay as typeof sdkUtils.setBlocksDelay,
  };
};

export const customRpcConfig = {
  lbp: {
    getPoolAccount: {
      description: 'Get LBP pool account by assets IDs',
      params: [
        {
          name: 'asset0Id',
          type: 'AssetId',
        },
        {
          name: 'asset0Id',
          type: 'AssetId',
        },
      ],
      type: 'AccountId',
    },
  },
  xyk: {
    getPoolAccount: {
      description: 'Get XYK pool account by assets IDs',
      params: [
        {
          name: 'asset0Id',
          type: 'AssetId',
        },
        {
          name: 'asset0Id',
          type: 'AssetId',
        },
      ],
      type: 'AccountId',
    },
    getPoolBalances: {
      description: 'Get XYK pool balances by pool account address',
      params: [
        {
          name: 'poolAddress',
          type: 'AccountId',
        },
        {
          name: 'at',
          type: 'BlockHash',
        },
      ],
      type: 'ResponseType',
    },
  },
};
