import { getTokenAmount } from './getTokenAmount';

export async function getFrozenFeeTokenAmount(account: string, assetId: string) {
  return getTokenAmount(account, assetId, 'feeFrozen');
}
