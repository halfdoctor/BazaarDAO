import { ComponentProps } from 'react';

import { Textarea as UiTextarea } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';

interface Props extends ComponentProps<typeof UiTextarea> {
  alwaysEnabled?: boolean;
}

function Textarea ({
  disabled,
  alwaysEnabled,
  children,
  ...rest
}: Props) {
  const { currentProvider, isRightNetwork } = useWeb3Context();
  const isDisabled = disabled || (!alwaysEnabled && (!currentProvider?.isConnected || !isRightNetwork));

  return (
    <UiTextarea
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </UiTextarea>
  );
};

export default Textarea;
