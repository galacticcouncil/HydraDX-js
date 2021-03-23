import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';

let api: HydraApiPromise;
let HydraAccount = '5EKq4zjH8skHctyTS5QGaQYQnw3xyPW6cqkAPLPhwiap62DQ';

test('Test getAssetList structure', async () => {
  api = await Api.initialize({}, 'wss://rpc-01.snakenet.hydradx.io');
  const assetList = await api.hydraDx.query.getAssetList(HydraAccount);
  
  expect(assetList).toEqual(
    [{
      assetId: 0,
      name: 'HDX'
    }]
  );
});