import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  OverrideModuleType,
  RegistryTypes,
} from '@polkadot/types/types/registry';

import { ApiListeners, HydraApiPromise } from './types';

import ChainTypeConfigFallbackHydraDx from './config/type';
import ChainAliasConfigFallbackHydraDx from './config/alias';
import ChainTypeConfigFallbackBasilisk from './config/typeBasilisk';
import ChainAliasConfigFallbackBasilisk from './config/aliasBasilisk';

import { processChainEvent } from './methods/tx/_events';

import { initHdxEventEmitter } from './utils/eventEmitter';
import { decorateExchangeTxDataScopeToExternalBN } from './utils';

import * as query from './methods/query';
import * as tx from './methods/tx';

let api: HydraApiPromise;

const getApi = (): HydraApiPromise => api;

/**
 * initialize
 * @param apiListeners - listeners for chain events
 * @param apiUrl - URl for connection to the chain (default - ws://127.0.0.1:9944)
 * @param typesConfig -
 * {
      types: RegistryTypes;
      alias: Record<string, OverrideModuleType>;
   } - custom types and aliases for connected chain. Fallback types and aliases
 * are defined for HydraDX node.
 * @param maxRetries - maximum number of connect attempts to the chain
 * @param chainName
 */
const initialize = async (
  apiListeners: ApiListeners | null = null,
  apiUrl: string = 'ws://127.0.0.1:9944',
  typesConfig:
    | {
        types: RegistryTypes;
        alias: Record<string, OverrideModuleType>;
      }
    | null
    | undefined = undefined,
  maxRetries: number = 20,
  chainName: string = 'hydraDx'
): Promise<HydraApiPromise> => {
  return new Promise<any>(async (resolve, reject) => {
    const wsProvider = new WsProvider(apiUrl, false);
    let reconnectionsIndex = 0;
    let isDisconnection = false;

    try {
      initHdxEventEmitter();
    } catch (e) {
      console.log(e);
    }

    /**
     * Recovering connection to WS. Will be done "reconnectionsNumber" attempts.
     * If connection is not recovered, API listener "error" will be executed.
     */
    const recoverConnection = (error: Error) => {
      if (reconnectionsIndex < maxRetries) {
        setTimeout(() => {
          wsProvider.connect();
          reconnectionsIndex++;
          console.log(`Reconnection - #${reconnectionsIndex}`);
        }, 500);
      } else {
        reconnectionsIndex = 0;
        if (apiListeners && apiListeners.error) {
          apiListeners.error(error);
        }
      }
    };

    const addTxEventListener = (apiInst: HydraApiPromise) => {
      // We need set event listener even if user didn't provide handler callback
      // for this.
      let onTxEventCallback = (data: any) => {};
      if (apiListeners && apiListeners.onTxEvent)
        onTxEventCallback = apiListeners.onTxEvent;

      apiInst.query.system.events((events: any) => {
        processChainEvent(events, pairedEventsData =>
          onTxEventCallback(
            decorateExchangeTxDataScopeToExternalBN(pairedEventsData)
          )
        );
      });
    };

    /**
     * We need setup websocket listeners "on" before running connection.
     */

    wsProvider.on('error', async error => {
      recoverConnection(error);
    });

    wsProvider.on('connected', async () => {
      if (api) {
        resolve(api);
        return api;
      }

      await new ApiPromise({
        provider: wsProvider,
        types: typesConfig ? typesConfig.types : ChainTypeConfigFallbackHydraDx,
        typesAlias: typesConfig
          ? typesConfig.alias
          : ChainAliasConfigFallbackHydraDx,
      })
        .on('error', e => {
          if (!isDisconnection) {
            if (apiListeners && apiListeners.error) {
              apiListeners.error(e);
            }
            reject(e);
          }
        })
        .on('connected', () => {
          if (apiListeners && apiListeners.connected) {
            apiListeners.connected();
          }
          // resolve('connected');
          isDisconnection = false;
        })
        .on('disconnected', () => {
          /**
           * This event happens when connection has been lost and each time, when
           * connection attempt has been done with error.
           */
          if (!isDisconnection) {
            if (apiListeners && apiListeners.disconnected) {
              apiListeners.disconnected();
            }
            reject();
            isDisconnection = true;
            wsProvider.connect();
          }
        })
        .on('ready', apiInstance => {
          api = apiInstance;

          // TODO Must be reimplemented for better way
          switch (chainName) {
            case 'basilisk':
              api.basilisk = {
                query,
                tx,
              };
            default:
              api.hydraDx = {
                query,
                tx,
              };
          }

          if (apiListeners && apiListeners.ready) {
            apiListeners.ready(api);
          }
          addTxEventListener(api);
          resolve(api);
        })
        .isReadyOrError.then(apiResponse => {
          api = apiResponse;

          // TODO Must be reimplemented for better way
          switch (chainName) {
            case 'basilisk':
              api.basilisk = {
                query,
                tx,
              };
            default:
              api.hydraDx = {
                query,
                tx,
              };
          }

          if (apiListeners && apiListeners.connected) {
            apiListeners.connected(api);
          }
          addTxEventListener(api);
          resolve(api);
        })
        .catch(e => {
          if (apiListeners && apiListeners.error) {
            apiListeners.error(e);
          }
          reject(e);
        });
    });

    wsProvider.connect();
  });
};

const initializeHydraDx = async (
  apiListeners: ApiListeners | null = null,
  apiUrl: string = 'ws://127.0.0.1:9944',
  typesConfig:
    | {
        types: RegistryTypes;
        alias: Record<string, OverrideModuleType>;
      }
    | null
    | undefined = {
    types: ChainTypeConfigFallbackHydraDx,
    alias: ChainAliasConfigFallbackHydraDx,
  },
  maxRetries: number = 20
): Promise<HydraApiPromise> => {
  return initialize(apiListeners, apiUrl, typesConfig, maxRetries, 'hydraDx');
};

const initializeBasilisk = async (
  apiListeners: ApiListeners | null = null,
  apiUrl: string = 'ws://127.0.0.1:9944',
  typesConfig:
    | {
        types: RegistryTypes;
        alias: Record<string, OverrideModuleType>;
      }
    | null
    | undefined = {
    types: ChainTypeConfigFallbackBasilisk,
    alias: ChainAliasConfigFallbackBasilisk,
  },
  maxRetries: number = 20
): Promise<HydraApiPromise> => {
  return initialize(apiListeners, apiUrl, typesConfig, maxRetries, 'basilisk');
};

export default {
  initialize,
  initializeHydraDx,
  initializeBasilisk,
  getApi,
};
