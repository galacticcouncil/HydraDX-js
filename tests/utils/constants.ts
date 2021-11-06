import Api from "../../src/api";
import { HydraApiPromise } from "../../src/types";

let api: HydraApiPromise;

const generateBlockHash = async (): Promise<string> => {
    api = await Api.initialize({}, process.env.WS_URL);
    const hash = (await api.rpc.chain.getBlockHash()).toString();
    return hash;
}

export {
    generateBlockHash
}