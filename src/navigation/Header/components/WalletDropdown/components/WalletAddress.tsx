
import { trimString } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';

import AddressIcon from 'components/Custom/AddressIcon';

function WalletAddress () {
  const { currentProvider } = useWeb3Context();

  return (
    <>
      <AddressIcon address={currentProvider?.selectedAddress} size={20} />
      <span>{trimString(currentProvider?.selectedAddress)}</span>
    </>
  );
}

export default WalletAddress;
