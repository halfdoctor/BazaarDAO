import { ComponentProps } from 'react';

import { Textarea as UiTextarea } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';
import styled from 'styled-components';

import InfoTooltip from 'components/InfoTooltip';

interface Props extends ComponentProps<typeof UiTextarea> {
  label: string;
  alwaysEnabled?: boolean;
  labelTooltip?: string;
}

const InfoTooltipStyled = styled(InfoTooltip)`
  .q-ui-tooltip__content {
    white-space: pre-line;
  }
`;

function Textarea ({
  disabled,
  alwaysEnabled,
  children,
  labelTooltip,
  label,
  ...rest
}: Props) {
  const { isRightNetwork, isConnected } = useWeb3Context();
  const isDisabled = disabled || (!alwaysEnabled && (!isConnected || !isRightNetwork));

  return (
    <UiTextarea
      disabled={isDisabled}
      label={labelTooltip
        ? (
          <div style={{ display: 'flex' }}>
            <span>
              {label}
            </span>
            <InfoTooltipStyled description={labelTooltip} />
          </div>
        )
        : label
      }
      {...rest}
    >
      {children}
    </UiTextarea>
  );
};

export default Textarea;
