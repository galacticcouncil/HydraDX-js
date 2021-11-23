import wasmUtils from '../../../src/utils/wasmUtils';

test('Test getSpotPriceXyk wasm util function', async () => {
  const price = wasmUtils.xyk.getSpotPrice('100', '100');
  expect(price).not.toBe('0');
});
