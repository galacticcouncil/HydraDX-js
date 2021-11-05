import { HydraApiPromise } from '../../../src/types';
import Api from '../../../src/api';
let api: HydraApiPromise;

test('Test getFormattedAddress util', async () => {
  api = await Api.initializeBasilisk({}, process.env.WS_URL);

  const formattedAddress = await api.utils.getFormattedAddress(
    '5EDq4qrf3QN5AmKSAQ6Dn5CDUkJU6CZBreR6N45M5zd8rGmL'
  );
  const formattedAddressWithDefinedFormat = await api.utils.getFormattedAddress(
    '5EDq4qrf3QN5AmKSAQ6Dn5CDUkJU6CZBreR6N45M5zd8rGmL',
    10041
  );
  expect(formattedAddress).toEqual(
    'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS'
  );
  expect(formattedAddressWithDefinedFormat).toEqual(
    'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS'
  );
});
