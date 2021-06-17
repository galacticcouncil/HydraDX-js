import { getTokenAmount } from './getTokenAmount';

export async function getFreeTokenAmount(account: string, assetId: string) {
  return getTokenAmount(account, assetId, 'free');
}
