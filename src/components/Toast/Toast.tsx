import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@q-dev/q-ui-kit';
import { IconName } from '@q-dev/q-ui-kit/dist/components/Icon';

import { ToastContainer } from './styles';

export const toastTypes = ['success', 'error', 'info'] as const;

export type ToastType = typeof toastTypes[number];

interface Props extends HTMLAttributes<HTMLDivElement> {
  type?: ToastType;
  text: string;
  onClose: () => void;
}

function Toast ({
  type = 'info',
  text,
  onClose = () => {},
  ...rest
}: Props) {
  const { t } = useTranslation();

  const iconsMap: Record<ToastType, IconName> = {
    info: 'info',
    success: 'check-circle',
    error: 'cross-circle',
  };

  const titleMap: Record<ToastType, string> = {
    info: t('TOAST_INFO'),
    success: t('TOAST_SUCCESS'),
    error: t('TOAST_ERROR'),
  };

  return (
    <ToastContainer $type={type} {...rest}>
      <div className="toast-main">
        <div className="toast-icon-wrp">
          <Icon name={iconsMap[type]} />
        </div>

        <div className="toast-content">
          <h3 className="text-lg font-semibold">{titleMap[type]}</h3>
          <p className="toast-text text-sm">{text}</p>
        </div>

        <button className="toast-close" onClick={onClose}>
          <Icon name="cross" />
        </button>
      </div>
    </ToastContainer>
  );
};

export default Toast;
