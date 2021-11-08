import BigNumber from 'bignumber.js';
import { KeyringPair } from '@polkadot/keyring/types';
import { getAliceAccount } from './getAliceAccount';
import { HydraApiPromise } from '../../src/types';
import { transfer } from './transfer';
import { transferToken } from './transferToken';
import { TOKEN_IDS, ONE_HDX } from '../../src/constants';


export const createEnvironment = async (api: HydraApiPromise, account: KeyringPair, assetId?: string) => {
    const alice = getAliceAccount();

    if (assetId === '0') {
        await transfer(api, account.address, alice, new BigNumber(ONE_HDX));
    } else if (assetId) {
        await transferToken(api, account.address, alice, assetId, new BigNumber(ONE_HDX));
    } else {
        await transfer(api, account.address, alice, new BigNumber(ONE_HDX));

        for (let i = 0; i < 3; i++) {
            await transferToken(api, account.address, alice, TOKEN_IDS[i], new BigNumber(ONE_HDX));
        }
    }
}