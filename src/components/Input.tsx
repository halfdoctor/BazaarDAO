import { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode } from 'react';

import { Input as UiInput } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';

import InfoTooltip from 'components/InfoTooltip';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
interface Props extends Omit<InputProps, 'onChange' | 'prefix' | 'value'> {
  value: string | number | boolean;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  type?: HTMLInputTypeAttribute;
  decimals?: number;
  max?: string;
  prefix?: ReactNode;
  children?: ReactNode;
  labelTip?: string;
  alwaysEnabled?: boolean;
  onChange: (val: string) => void;
  labelTooltip?: string;
}

function Input ({
  value,
  label,
  error,
  type,
  disabled,
  hint,
  max,
  decimals,
  prefix,
  labelTip,
  children,
  onChange,
  alwaysEnabled,
  labelTooltip,
  ...rest
}: Props) {
  const { isConnected, isRightNetwork } = useWeb3Context();

  const isDisabled = disabled || (!alwaysEnabled && (!isConnected || !isRightNetwork));

  return (
    <UiInput
      value={value}
      label={labelTooltip
        ? (
          <div style={{ display: 'flex' }}>
            <span>
              {label}
            </span>
            <InfoTooltip description={labelTooltip} />
          </div>
        )
        : label
      }
      error={error}
      type={type}
      disabled={isDisabled}
      decimals={decimals}
      labelTip={labelTip}
      hint={hint}
      max={max}
      prefix={prefix}
      onChange={onChange}
      {...rest}
    >
      {children}
    </UiInput>
  );
};

export default Input;
