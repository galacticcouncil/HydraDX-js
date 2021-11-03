import { ChainName } from '../types';

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
];

export const exposeApiMethods = (
  methodsScope: { query: any; tx: any },
  chainName: ChainName
) => {
  const exposedMethods = {
    query: {},
    tx: methodsScope.tx,
  };

  const filterMethods = (methods: any, pattern: string[]) => {
    const methodsArr = Object.entries(methods);
    const filteredArr = methodsArr.filter(function ([key]) {
      return pattern.includes(key);
    });
    return Object.fromEntries(filteredArr);
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

  return exposedMethods;
};

export const customRpcConfig = {
  lbp: {
    getPoolAccount: {
      description: 'Get LBP pool account by assets IDs',
      params: [
        {
          name: 'asset0Id',
          type: 'AssetId'
        },
        {
          name: 'asset0Id',
          type: 'AssetId',
        }
      ],
      type: 'AccountId'
    }
  },
  xyk: {
    getPoolAccount: {
      description: 'Get XYK pool account by assets IDs',
      params: [
        {
          name: 'asset0Id',
          type: 'AssetId'
        },
        {
          name: 'asset0Id',
          type: 'AssetId',
        }
      ],
      type: 'AccountId'
    }
  }
}