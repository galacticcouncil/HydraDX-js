import { Keyring } from '@polkadot/keyring';

export const getRandomAccount = () => {
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
  const alice = keyring.addFromUri(`//${(new Date().toString())}`);

  return alice;
}