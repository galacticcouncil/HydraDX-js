import { Keyring } from '@polkadot/keyring';

export const getAliceAccount = () => {
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
  const alice = keyring.addFromUri('//Alice');

  return alice;
}