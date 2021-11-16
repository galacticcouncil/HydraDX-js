import Api from '../../api';
import BigNumber from 'bignumber.js';
import type { RelayChainValidationDataHuman } from '../../types';
import { ApiInstanceError, ApiBaseError } from '../../utils/errorHandling';

/**
 * getBlockHeightRelayChain - provides blockHeight of relay chain
 */
export const getBlockHeightRelayChain = async (
  blockHash?: string | null
): Promise<BigNumber> => {
  return new Promise<BigNumber>(async (resolve, reject) => {
    try {
      const api = Api.getApi();

      if (!api) throw new ApiInstanceError('getBlockHeightRelayChain');

      /**
       * validationDataResponse has the next structure:
       *
       * {
        parentHead: '0xb9b654...',
        relayParentNumber: 9895669,
        relayParentStorageRoot: '0xdde0...',
        maxPovSize: 5242880,
      }
       */
      const validationDataResponse = blockHash
        ? await api.query.parachainSystem.validationData.at(blockHash)
        : await api.query.parachainSystem.validationData();

      const dataToHuman = validationDataResponse.toHuman() as RelayChainValidationDataHuman;

      if (
        !dataToHuman ||
        !dataToHuman.relayParentNumber ||
        typeof dataToHuman.relayParentNumber !== 'string'
      )
        throw new ApiBaseError(
          'getBlockHeightRelayChain',
          'Validation data has unknown structure'
        );

      // "relayParentNumber" contains string interpretation of a block number in
      // the next format - "9,903,911"
      resolve(new BigNumber(dataToHuman.relayParentNumber.replace(/,/g, '')));
    } catch (e: any) {
      console.log(e);
      reject(e);
    }
  });
};
