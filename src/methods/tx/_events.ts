import {
  ChainBlockEventsCallback,
  ExchangeTxEventData,
  MergedPairedEvents,
} from '../../types';
import { getHdxEventEmitter } from '../../utils/eventEmitter';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import Api from '../../api';

let mergedPairedEvents: MergedPairedEvents = {};

const mergeEventToScope = (receivedEventData: any) => {
  const intentionId = receivedEventData.data.id;
  let pairedEventData = mergedPairedEvents[intentionId];

  const getMergeStatus = () => {
    const { status } = pairedEventData;

    /**
     * Status property can be changed only to true.
     */
    return {
      ready: receivedEventData.status.ready || status!.ready,
      inBlock: receivedEventData.status.inBlock || status!.inBlock,
      finalized: receivedEventData.status.finalized || status!.finalized,
      error: [...status!.error, ...receivedEventData.status.error],
    };
  };

  if (pairedEventData === undefined) {
    pairedEventData = receivedEventData;
  } else {
    pairedEventData = {
      dispatchInfo: [
        ...(pairedEventData.dispatchInfo || []),
        ...(receivedEventData.dispatchInfo || []),
      ],
      section: [...pairedEventData.section, ...receivedEventData.section],
      method: [...pairedEventData.method, ...receivedEventData.method],
      status: getMergeStatus(),
      data: {
        ...pairedEventData.data,
        ...receivedEventData.data,
        directTrades: [
          ...(pairedEventData.data.directTrades || []),
          ...(receivedEventData.data.directTrades || []),
        ],
        fees: [
          ...(pairedEventData.data.fees || []),
          ...(receivedEventData.data.fees || []),
        ],
      },
    };
  }

  /**
   * Transaction values calculations
   */

  /**
   * Calculate "match" value - total amount, which has been matched by Direct trade
   */
  if (
    receivedEventData.method[0] === 'IntentionResolvedDirectTrade' &&
    pairedEventData.data !== undefined &&
    pairedEventData.data.directTrades !== undefined
  ) {
    let totalDirectTradeMatch = new BigNumber(0);
    let totalDirectTradeExchanged = new BigNumber(0);

    pairedEventData.data.directTrades.forEach(item => {
      if (pairedEventData.data.intentionType === 'BUY') {
        totalDirectTradeMatch = totalDirectTradeMatch.plus(item.amountReceived);
        totalDirectTradeExchanged = totalDirectTradeExchanged.plus(item.amountSent);
      } else {
        totalDirectTradeMatch = totalDirectTradeMatch.plus(item.amountSent);
        totalDirectTradeExchanged = totalDirectTradeExchanged.plus(item.amountReceived);
      }
    });
    pairedEventData.data.match = totalDirectTradeMatch;
    pairedEventData.data.totalDirectTradeExchanged = totalDirectTradeExchanged;
  }

  /**
   * Calculate "totalFeeFinal" - total amount of direct trade fees.
   */
  if (
    receivedEventData.method[0] === 'IntentionResolvedDirectTradeFees' &&
    pairedEventData.data !== undefined &&
    pairedEventData.data.fees !== undefined
  ) {
    let totalFeesAmount = new BigNumber(0);
    pairedEventData.data.fees.forEach(feeItem => {
      totalFeesAmount = totalFeesAmount.plus(feeItem.amount);
    });
    pairedEventData.data.totalFeeFinal = totalFeesAmount;
  }

  /**
   * Calculate "totalAmountFinal" - total amount from all types of trading for
   * this specific exchange action +/- fees.
   */

  const totalXykTradeAmount: BigNumber =
    pairedEventData.data && pairedEventData.data.amountOutXykTrade !== undefined
      ? pairedEventData.data.amountOutXykTrade
      : new BigNumber(0);

  const totalDirectTradeAmount: BigNumber =
    pairedEventData.data && pairedEventData.data.totalDirectTradeExchanged !== undefined
      ? pairedEventData.data.totalDirectTradeExchanged
      : new BigNumber(0);

  const totalFeeAmount: BigNumber =
    pairedEventData.data && pairedEventData.data.totalFeeFinal !== undefined
      ? pairedEventData.data.totalFeeFinal
      : new BigNumber(0);

  if (!pairedEventData.data) pairedEventData.data = { id: null };

  pairedEventData.data.totalAmountFinal = totalXykTradeAmount
    .plus(totalDirectTradeAmount);

  pairedEventData.data.totalAmountFinal =
    pairedEventData.data.intentionType === 'BUY'
      ? pairedEventData.data.totalAmountFinal.plus(totalFeeAmount)
      : pairedEventData.data.totalAmountFinal.minus(totalFeeAmount);

  mergedPairedEvents[intentionId] = pairedEventData;
};

export const processChainEvent = (
  records: any,
  eventCallback: ChainBlockEventsCallback
) => {
  if (!records) return;
  const hdxEventEmitter = getHdxEventEmitter();
  const api = Api.getApi();

  mergedPairedEvents = {}; // set/clear tmp storage with tx-s merged by intentionID

  const newEvents = records.filter(({ event }: { event: any }) =>
    [
      'IntentionRegistered',
      'IntentionResolvedAMMTrade',
      'IntentionResolvedDirectTrade',
      'IntentionResolvedDirectTradeFees',
      'IntentionResolveErrorEvent',
    ].includes(event.method)
  );

  newEvents.forEach((eventRecord: any) => {
    if (!eventRecord.event) {
      return;
    }

    const { event, phase } = eventRecord;
    const { data, method, section } = event;

    const [dispatchInfo] = data;
    let exchangeTxEventData: ExchangeTxEventData = {
      section: [section],
      method: [method],
      dispatchInfo: [dispatchInfo.toString()],
      status: {
        ready: phase === 'isReady',
        inBlock: phase === 'isInBlock',
        finalized: phase === 'isFinalized',
        error: [],
      },
      data: {
        id: null,
      },
    };

    const parsedData = data.toJSON();

    switch (method) {
      case 'IntentionRegistered':
        /**
         * parsedData: <Array> [AccountId, AssetId, AssetId, Balance, IntentionType, IntentionID]
         *                     [who, asset a, asset b, amount, intention type, intention id]
         */
        if (Array.isArray(parsedData) && parsedData.length === 6) {
          mergeEventToScope({
            ...exchangeTxEventData,
            data: {
              id: parsedData[5]?.toString(),
              intentionType: parsedData[4]?.toString(),
              account: parsedData[0]?.toString(),
              asset1: parsedData[1]?.toString(),
              asset2: parsedData[2]?.toString(),
              amount: new BigNumber(parsedData[3]?.toString() || 0),
            },
          });
        }
        break;
      case 'IntentionResolvedAMMTrade':
        /**
         * parsedData: <Array> [AccountId, IntentionType, IntentionID, Balance, Balance]
         *                     [who, intention type, intention id, amount, amount sold/bought]
         */
        if (Array.isArray(parsedData)) {
          mergeEventToScope({
            ...exchangeTxEventData,
            data: {
              id: parsedData[2]?.toString(),
              intentionType: parsedData[1]?.toString(),
              account: parsedData[0]?.toString(),
              amountXykTrade: new BigNumber(parsedData[3]?.toString() || 0),
              amountOutXykTrade: new BigNumber(parsedData[4]?.toString() || 0),
            },
          });
        }
        break;
      case 'IntentionResolvedDirectTrade':
        /**
         * parsedData: <Array> [AccountId, AccountId, IntentionID, IntentionID, Balance, Balance]
         *                     [User1 acc id, User2 acc id, intention id 1, intention id 2, amount 1, amount 2]
         *
         * First amount is amount of asset A going from first account to second account,
         * and the second amount is asset B going from second account to first account.
         *
         * Which assets have been used - check in event "IntentionRegistered" by
         * appropriate IntentionID.
         *
         * One exchange action (sell/buy) can includes multiple direct trade transactions,
         * that's why we need track all direct trade transactions for one exchange action.
         */
        if (Array.isArray(parsedData)) {
          mergeEventToScope({
            ...exchangeTxEventData,
            intentions: [parsedData[2]?.toString(), parsedData[3]?.toString()],
            data: {
              id: parsedData[2]?.toString(),
              directTrades: [
                {
                  amountSent: new BigNumber(parsedData[4]?.toString() || 0),
                  amountReceived: new BigNumber(parsedData[5]?.toString() || 0),
                  account1: parsedData[0]?.toString(),
                  account2: parsedData[1]?.toString(),
                  pairedIntention: parsedData[3]?.toString(),
                },
              ],
            },
          });
          mergeEventToScope({
            ...exchangeTxEventData,
            intentions: [parsedData[2]?.toString(), parsedData[3]?.toString()],
            data: {
              id: parsedData[3]?.toString(),
              directTrades: [
                {
                  amountSent: new BigNumber(parsedData[5]?.toString() || 0),
                  amountReceived: new BigNumber(parsedData[4]?.toString() || 0),
                  account1: parsedData[1]?.toString(),
                  account2: parsedData[0]?.toString(),
                  pairedIntention: parsedData[2]?.toString(),
                },
              ],
            },
          });
        }
        break;
      case 'IntentionResolvedDirectTradeFees':
        /**
         * parsedData: <Array> [AccountId, IntentionID, AccountId, AssetId, Balance]
         *                     [who, IntentionID, account paid to, asset, fee amount]
         */
        if (Array.isArray(parsedData)) {
          mergeEventToScope({
            ...exchangeTxEventData,
            data: {
              id: parsedData[1]?.toString(),
              fees: [
                {
                  account1: parsedData[0]?.toString(),
                  account2: parsedData[2]?.toString(),
                  asset: parsedData[3]?.toString(),
                  amount: new BigNumber(parsedData[4]?.toString()),
                },
              ],
            },
          });
        }
        break;
      case 'IntentionResolveErrorEvent':
        /**
         * parsedData: <Array> [AccountId, AssetPair, IntentionType, IntentionId, dispatch]
         *                     [who, assets, sell or buy, intention id, error detail]
         */
        if (Array.isArray(parsedData)) {
          const dispatchError = parsedData[4];
          let errorDetails = dispatchError.toString();

          if (
            parsedData[4].module !== undefined &&
            new BigNumber(dispatchError.module.error).isInteger() &&
            new BigNumber(dispatchError.module.index).isInteger()
          ) {
            const { docs, section, name } = api.registry.findMetaError(
              {
                error: new BN(dispatchError.module.error),
                index: new BN(dispatchError.module.index),
              }
            );
            errorDetails = {
              section,
              name,
              documentation: docs.join(' '),
            };
          }

          mergeEventToScope({
            ...exchangeTxEventData,
            status: {
              ...exchangeTxEventData.status,
              error: [
                {
                  method,
                  data,
                },
              ],
            },
            data: {
              id: parsedData[3]?.toString(),
              account: parsedData[0]?.toString(),
              intentionType: parsedData[2]?.toString(),
              assetsPair: parsedData[1]?.toString(),
              errorDetails,
            },
          });
        }
        break;
    }
  });

  /**
   * If "mergedPairedEvents" contains any error, we need reject with failed tx data.
   */
  hdxEventEmitter.emit('onSystemEventProcessed', mergedPairedEvents);

  /**
   * Send paired events data for subscribed for all system events UI listener
   */
  eventCallback(mergedPairedEvents);
};

export const processExchangeTransactionEvent = (events: any) => {
  return new Promise((resolve, reject): void => {
    let currentTxIntentionId: string = '';
    let errorData: any = null;
    const hdxEventEmitter = getHdxEventEmitter();

    events.forEach((eventRecord: any) => {
      if (!eventRecord.event) {
        return;
      }

      const { data, method } = eventRecord.event;

      const parsedData = data.toJSON();

      /**
       * parsedData: <Array> [AccountId, AssetId, AssetId, Balance, IntentionType, IntentionID]
       *                     [who, asset a, asset b, amount, intention type, intention id]
       */
      if (
        method === 'IntentionRegistered' &&
        Array.isArray(parsedData) &&
        parsedData.length === 6
      ) {
        currentTxIntentionId = parsedData[5].toString();
      }

      if (method === 'ExtrinsicFailed') {
        errorData = data; //TODO add error data processing
      }
    });

    if (errorData) {
      reject(errorData);
      return; // Terminate execution "processExchangeTransactionEvent" function here.
    }

    //TODO wait for data from system.events
    if (!currentTxIntentionId || currentTxIntentionId.length === 0) {
      reject(
        new Error('Intention ID has not been found in exchange even data.')
      );
      return; // Terminate execution "processExchangeTransactionEvent" function here.
    }

    //TODO check all required fields in tx data
    if (mergedPairedEvents[currentTxIntentionId] !== undefined) {
      resolve(mergedPairedEvents[currentTxIntentionId]);
      return; // Terminate execution "processExchangeTransactionEvent" function here.
    }

    const checkPairedTxData = (systemEventPairedData: MergedPairedEvents) => {
      //TODO check all required fields in tx data
      if (systemEventPairedData[currentTxIntentionId] !== undefined) {
        resolve(systemEventPairedData[currentTxIntentionId]);

        hdxEventEmitter.removeListener(
          'onSystemEventProcessed',
          checkPairedTxData
        );
        return;
      }
    };

    hdxEventEmitter.on('onSystemEventProcessed', checkPairedTxData);
  });
};
