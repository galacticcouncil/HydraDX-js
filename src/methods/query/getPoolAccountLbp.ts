import Api from '../../api';
import { AnyJson, Codec } from '@polkadot/types/types';
import { ApiInstanceError, ApiBaseError } from '../../utils/errorHandling';

/**
 * Provides LBP pool account address by assets IDs.
 * @param assetA: <string>
 * @param assetB: <string>
 */
export async function getPoolAccountLbp(
  assetA: string,
  assetB: string
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) throw new ApiInstanceError('getPoolAccountLbp');

      let poolAddress: string | Codec | AnyJson =
        // lbp.getPoolAccount is a custom RPC call, which is defined during API
        // initialization but not visible for TypeScript
        // TODO Fix typing of api.rpc.lbp
        // @ts-ignore
        await api.rpc.lbp.getPoolAccount(assetA, assetB);

      if (!poolAddress) throw new ApiBaseError('getPoolAccountLbp');

      poolAddress = poolAddress.toString();

      resolve(poolAddress);
    } catch (e: any) {
      console.log(e);
      reject(e);
    }
  });
}
