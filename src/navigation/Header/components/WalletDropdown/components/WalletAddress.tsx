
import { trimString } from '@q-dev/utils';

import AddressIcon from 'components/Custom/AddressIcon';

import { useUser } from 'store/user/hooks';

function WalletAddress () {
  const user = useUser();

  return (
    <>
      <AddressIcon address={user.address} size={20} />
      <span>{trimString(user.address)}</span>
    </>
  );
}

export default WalletAddress;
