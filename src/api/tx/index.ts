import Api from '../../api';
import { bnToBn, formatBalance } from "@polkadot/util";
import { bnToDec, decToBn } from '../../utils';

async function withdrawLiquiditySMPool(account: string, asset1: string, asset2: string, liquidityBalance: any, selectedPool: any, percentage: number) {
    return new Promise(async (resolve) => {
        const api = Api.getApi();

        if (api && account && selectedPool) {
          const signer = await Api.getSinger(account);
          const liquidityToRemove = liquidityBalance
            .div(bnToBn(100))
            .mul(percentage);
    
          api.tx.amm
            .removeLiquidity(asset1, asset2, liquidityToRemove)
            .signAndSend(account, { signer: signer }, ({ status }) => {
                resolve(status);
            });
        }
    });
}

async function swapSMTrade(account: string, asset1: string, asset2: string, amount: any, actionType: string) {
    return new Promise(async (resolve, reject) => {
        const api = Api.getApi();
    
        if (api && account && amount && asset1 != null && asset2 != null) {
          const signer = await Api.getSinger(account);
          if (actionType === 'buy') {
            api.tx.exchange
              //TODO: CALCULATE LIMITS FROM SPOT PRICE
              .buy(asset1, asset2, amount, bnToBn('100000000000000000'), false)
              .signAndSend(account, { signer: signer }, ({ events, status }: { events: any; status: any }) => {
                resolve({events, status});
              })
              .catch(() => {
                reject();
              });
          } else {
            api.tx.exchange
              //TODO: CALCULATE LIMITS FROM SPOT PRICE
              .sell(asset1, asset2, amount, bnToBn(1000), false)
              .signAndSend(account, { signer: signer }, ({ events, status }:  { events: any; status: any }) => {
                resolve({events, status});
              })
              .catch(() => {
                reject();
              });
          }
        }
    });
};

export {
    withdrawLiquiditySMPool,
    swapSMTrade
}