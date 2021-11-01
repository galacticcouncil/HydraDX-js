import Api from '../../api';
import BigNumber from 'bignumber.js';

/**
 * getBlockHeightRelayChain - provides blockHeight of relay chain
 */
export const getBlockHeightRelayChain = async (): Promise<BigNumber | null> => {
  try {
    const api = Api.getApi();

    if (!api) return null;

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
    const validationDataResponse = await api.query.parachainSystem.validationData();

    const dataToHuman = validationDataResponse.toHuman();

    if (
      !dataToHuman ||
      !dataToHuman.relayParentNumber ||
      typeof dataToHuman.relayParentNumber !== 'string'
    )
      return null;

    // "relayParentNumber" contains string interpretation of a block number in
    // the next format - "9,903,911"
    return new BigNumber(dataToHuman.relayParentNumber.replace(/,/g, ''));
  } catch (e) {
    console.log(e);
    return null;
  }
};
