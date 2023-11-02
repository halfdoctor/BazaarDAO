import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import DecodedCallDataViewer from 'components/DecodedCallDataViewer';

interface Props extends HTMLAttributes<HTMLDivElement> {
  callData: string;
  votingSituation: string;
  externalAbi?: string[];
}

function ExternalCallDataDetails ({ callData, votingSituation, className, externalAbi }: Props) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h3 className="text-h3">{t('UPDATE')}</h3>

      <div className="block__content">
        <DecodedCallDataViewer
          withoutHeader
          callData={callData}
          votingSituation={votingSituation}
          abi={externalAbi}
        />
      </div>
    </div>
  );
}

export default ExternalCallDataDetails;
