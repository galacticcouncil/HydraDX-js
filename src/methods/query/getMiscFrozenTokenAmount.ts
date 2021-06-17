import { getTokenAmount } from './getTokenAmount';

export async function getMiscFrozenTokenAmount(account: string, assetId: string) {
  return getTokenAmount(account, assetId, 'miscFrozen');
}
