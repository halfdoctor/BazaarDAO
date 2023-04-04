import { useTranslation } from 'react-i18next';

import { ProposalBaseInfo } from 'typings/proposals';

import LinkViewer from '../../LinkViewer';

interface Props {
  proposal: ProposalBaseInfo;
}

function BaseDetails ({ proposal }: Props) {
  const { t } = useTranslation();

  return (
    <div className="details-list-item">
      <div className="details-item">
        <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
        <LinkViewer link={proposal.remark} />
      </div>
    </div>
  );
}

export default BaseDetails;
