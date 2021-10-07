import Api from '../../api';
import { processExchangeTransactionEvent } from './_events';

import { RegistryError } from '@polkadot/types/types/registry';

export const txCallback = (resolve: any, reject: any, methodName?: string) => ({
  dispatchError,
  dispatchInfo,
  events,
  status,
}: any) => {
  const api = Api.getApi();

  if (methodName === 'exchange') {
    processExchangeTransactionEvent(events)
      .then((transactionData: any): void => resolve(transactionData))
      .catch(transactionErrorData => reject(transactionErrorData));
    return;
  } else {
    if (status.isInBlock) {
      const successEvents: any[] = [];
      const errorEvents: any[] = [];

      events.forEach((event: any) => {
        if (api.events.system.ExtrinsicSuccess.is(event.event)) {
          successEvents.push(event);
        } else if (api.events.system.ExtrinsicFailed.is(event.event)) {
          errorEvents.push(event);
        }
      });

      if (errorEvents.length) {
        const errorData = errorEvents.map(({ event }) => {
          const [dispatchError, dispatchInfo] = event.data;
          let errorInfo;

          if (dispatchError.isModule) {
            const { docs, section, name } = api.registry.findMetaError(
              dispatchError.asModule
            ) as RegistryError;

            errorInfo = {
              section,
              name,
              documentation: docs.join(' '),
            };
          } else {
            errorInfo = dispatchError.toString();
          }

          return errorInfo;
        });

        reject({
          type: 'ExtrinsicFailed',
          data: errorData,
        });
      } else {
        const successData = (successEvents.length > 0
          ? successEvents
          : events
        ).map(({ event: { section, method, data } }: any) => {
          const [dispatchInfo] = data;

          return {
            section,
            method,
            dispatchInfo: dispatchInfo.toString(),
          };
        });

        resolve({
          data: successData,
        });
      }
    }
  }
};

export const txCatch = (reject: any) => (error: any) => {
  reject({
    type: 'Error',
    data: error.message,
  });
};
