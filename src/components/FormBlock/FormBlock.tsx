import { ReactNode } from 'react';

import { Icon } from '@q-dev/q-ui-kit';
import { IconName } from '@q-dev/q-ui-kit/dist/components/Icon';

import Button from 'components/Button';

import { StyledFormBlock } from './styles';

interface Props {
  icon?: IconName;
  title?: string;
  disabled?: boolean;
  onAction?: () => void;
  children: ReactNode | ReactNode[];
  block?: boolean;
}

function FormBlock ({
  icon,
  title,
  disabled = false,
  onAction,
  children,
  block = true
}: Props) {
  return (
    <StyledFormBlock $disabled={disabled} $block={block}>
      {icon && (
        <Button
          icon
          disabled={disabled}
          className="form-block__edit-btn"
          look="ghost"
          onClick={onAction}
        >
          <Icon name={icon} />
        </Button>
      )}

      {title && (
        <p className="form-block__title text-lg font-semibold">
          {title}
        </p>
      )}

      <div className="form-block__content">
        {children}
      </div>
    </StyledFormBlock>
  );
}

export default FormBlock;
