import { useTranslation } from 'react-i18next';

import { Tooltip } from '@q-dev/q-ui-kit';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

import useNetworkConfig from 'hooks/useNetworkConfig';

import { TooltipContent } from './styles';

interface Props {
  address: string;
}

function GnosisSafeTooltip ({ address }: Props) {
  const { t } = useTranslation();
  const { gnosisSafeUrl } = useNetworkConfig();

  const gnosisIcon = (
    <svg width="12" height="12">
      <path d="M6 0.00799561C2.69666 0.00866227 0.0193315 2.68666 0.0196648 5.98999C0.0196648 9.29333 2.698 11.9707 6.001 11.9707C9.30433 11.9707 11.982 9.29266 11.982 5.98933C11.982 4.40266 11.352 2.88133 10.23 1.75966C9.108 0.637995 7.58666 0.00799561 6 0.00799561ZM10.3783 6.316H7.60333C7.43166 7.17533 6.63166 7.761 5.76066 7.665C4.88966 7.569 4.23633 6.82333 4.256 5.94733C4.27533 5.07133 4.961 4.35533 5.83533 4.29833C6.71 4.241 7.483 4.86166 7.61633 5.72766H10.3787C10.4863 5.72366 10.5877 5.779 10.6427 5.87166C10.6977 5.96433 10.6977 6.07933 10.6427 6.172C10.5877 6.26466 10.486 6.32 10.3783 6.316Z" fill="#00b897" />
    </svg>
  );

  return (
    <Tooltip trigger={gnosisIcon}>
      <TooltipContent>
        <span>{t('GNOSIS_SAFE_ADDRESS')}</span>
        <div className="tooltip-address">
          <ExplorerAddress
            short
            hideTooltip
            address={address}
          />
        </div>
        <a
          className="link tooltip-link"
          href={`${gnosisSafeUrl}/#/safes/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('VIEW_ON_GNOSIS_SAFE_UI')}
        </a>
      </TooltipContent>
    </Tooltip>
  );
}

export default GnosisSafeTooltip;
