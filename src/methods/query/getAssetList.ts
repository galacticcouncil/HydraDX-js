import { AssetRecord } from '../../types';
import Api from '../../api';

// TODO Update for work with different chains (HydraDX and Basilisk).
//  Base asset is different for different chains - HDX | BSX.
//  It can be fetched from the chain (api.registry.getChainProperties())

export async function getAssetList(blockHash?: string | undefined) {
  return new Promise<any[]>(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) return resolve([]);
      const assetIds = blockHash
        ? await api.query.assetRegistry.assetIds.entriesAt(blockHash)
        : await api.query.assetRegistry.assetIds.entries();
      const assetList: AssetRecord[] = [{ assetId: 0, name: 'HDX' }];

      // TODO: Better way to parse mapped records
      assetIds.forEach(([assetName, id]) => {
        const assetId = parseInt(api.createType('Option<u32>', id).toString());
        const name = assetName.toHuman()?.toString() || '0xERR';

        assetList[assetId] = { assetId, name };
      });

      resolve(assetList);
    } catch (e: any) {
      reject(e);
    }
  });
}
