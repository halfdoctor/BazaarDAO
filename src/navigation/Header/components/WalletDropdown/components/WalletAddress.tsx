
import { trimString } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';

import AddressIcon from 'components/Custom/AddressIcon';

function WalletAddress () {
  const { address } = useWeb3Context();

  return (
    <>
      <AddressIcon address={address} size={20} />
      <span>{trimString(address)}</span>
    </>
  );
}

export default WalletAddress;
