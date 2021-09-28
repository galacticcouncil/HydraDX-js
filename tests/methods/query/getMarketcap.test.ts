import BigNumber from 'bignumber.js';

import Api from '../../../src/api';
import { HydraApiPromise } from '../../../src/types';
import { getAliceAccount } from '../../utils/getAliceAccount';
import { createPool } from '../../utils/createPool';
import { destroyAllPools } from '../../utils';

let api: HydraApiPromise;

test('Test getMarketcap structure', async () => {
    const api = await Api.initialize({}, process.env.WS_URL);
    const alice = getAliceAccount();
    await destroyAllPools(api, alice);

    const assetList = await api.hydraDx.query.getAssetList(alice.address);

    const asset1 = assetList[0].assetId;
    const asset2 = assetList[1].assetId;
    // const result = await api.hydraDx.query.getPoolAssetsAmounts(asset1.toString(), asset2.toString());

    const address = await createPool(api, alice, asset2.toString(), (asset2 + 1).toString(), new BigNumber(1).multipliedBy('1e12'), new BigNumber(1).multipliedBy('1e18'));

    let poolInfo = await api.hydraDx.query.getPoolInfo();

    const pools = Object.keys(poolInfo.poolInfo);
    let newPool: any = [];
    await Promise.all(pools.map(async (pool) => {
        const ObjPool = poolInfo.poolInfo[pool];
        const poolResult = await api.hydraDx.query.getPoolAssetsAmounts(ObjPool.poolAssets[0].toString(), ObjPool.poolAssets[1].toString());
        const poolTotal = parseInt(poolResult.asset1) + parseInt(poolResult.asset2);

        const pu: any = {};
        if (address === pool) {
            pu[pool] = {
                'marketCap': poolTotal
            };
            newPool = pu;
        }
        if (address === '') {
            pu[pool] = {
                'marketCap': poolTotal
            };
            newPool.push(pu);
        }
    }));

    if (address == '') {
        const expected: any = [];

        pools.map(async (pool) => {
            const exp: any = {};
            exp[pool] = {
                'marketCap': 2000000000000
            };
            expected.push(exp);
        });
        expect(newPool).toEqual(expected);
    } else {
        const expected: any = {};
        expected[address] = {
            marketCap: 2000000000000
        };
        expect(newPool).toEqual(expected);
    }


});