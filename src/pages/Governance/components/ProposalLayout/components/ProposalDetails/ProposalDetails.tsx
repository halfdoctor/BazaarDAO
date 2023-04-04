import { useTranslation } from 'react-i18next';

import { ProposalBaseInfo } from 'typings/proposals';

import BaseDetails from './components/BaseDetails';

interface Props {
  proposal: ProposalBaseInfo;
}

function ProposalDetails ({ proposal }: Props) {
  const { t } = useTranslation();

  return (
    <div className="block">
      <h2 className="text-h2">{t('DETAILS')}</h2>

      <div className="block__content">
        <div className="details-list single-column">
          <BaseDetails proposal={proposal} />
        </div>
      </div>
    </div>
  );
}

export default ProposalDetails;
