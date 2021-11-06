import { AssetRecord } from '../../types';
import Api from '../../api';

export async function getAssetList(blockHash?: string | Uint8Array) {  

  return new Promise(async (resolve, reject) => {
    try {
      const api = Api.getApi();
      if (!api) return resolve([]);
      let assetIds: Array<any> = blockHash
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
    } catch(e: any) {
      reject(e);
    }
  });
}
