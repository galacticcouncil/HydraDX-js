import Api from '../../api';
import { AnyJson, Codec } from '@polkadot/types/types';

/**
 * Provides LBP pool account address by assets IDs.
 * @param assetA: <string>
 * @param assetB: <string>
 */
export async function getPoolAccountLbp(
  assetA: string,
  assetB: string
): Promise<string | null> {
  // We should terminate execution if required params are not provided
  if (!assetA && !assetB) return null;
  try {
    const api = Api.getApi();
    if (!api) return null;

    let poolAddress: string | Codec | AnyJson =
      // lbp.getPoolAccount is a custom RPC call, which is defined during API
      // initialization but not visible for TypeScript
      // TODO should be fixed
      // @ts-ignore
      await api.rpc.lbp.getPoolAccount(assetA, assetB);

    // @ts-ignore
    poolAddress = poolAddress.toString();

    return poolAddress;
  } catch (e: any) {
    console.log({
      section: 'lbp.getPoolAccountLbp',
      data: [e],
    });
    return null;
  }
}
