import { HTMLAttributes } from 'react';

import { Search as UiSearch } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  disabled?: boolean;
  alwaysEnabled?: boolean;
  onChange: (val: string) => void;
}

function Search ({
  value,
  disabled,
  onChange,
  alwaysEnabled,
  ...rest
}: Props) {
  const { currentProvider, isRightNetwork } = useWeb3Context();
  const isDisabled = disabled || (!alwaysEnabled && (!currentProvider?.isConnected || !isRightNetwork));

  return (
    <UiSearch
      value={value}
      disabled={isDisabled}
      onChange={onChange}
      {...rest}
    />
  );
};

export default Search;
