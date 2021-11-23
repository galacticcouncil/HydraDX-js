export function import_wasm() {
  return {
    xyk: import('hydra-dx-wasm/build/xyk/bundler'),
    lbp: import('hydra-dx-wasm/build/lbp/bundler'),
  };
}
