import { getTokenAmount } from './getTokenAmount';

export async function getReservedTokenAmount(account: string, assetId: string) {
  return getTokenAmount(account, assetId, 'reserved');
}
