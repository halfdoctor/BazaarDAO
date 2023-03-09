import { useTranslation } from 'react-i18next';

import { Proposal } from 'typings/proposals';

import LinkViewer from '../../LinkViewer';

interface Props {
  proposal: Proposal;
}

function QDetails ({ proposal }: Props) {
  const { t } = useTranslation();

  return (
    <div className="details-list-item">
      {Boolean(proposal.currentConstitutionHash) && (
        <div className="details-item">
          <p className="text-md color-secondary">{t('DETAILS_CURRENT_CONSTITUTION_HASH')}</p>
          <p className="text-md ellipsis">{proposal.currentConstitutionHash}</p>
        </div>
      )}

      {Boolean(proposal.newConstitutionHash) && (
        <div className="details-item">
          <p className="text-md color-secondary">{t('DETAILS_NEW_CONSTITUTION_HASH')}</p>
          <p className="text-md ellipsis">{proposal.newConstitutionHash}</p>
        </div>
      )}

      <div className="details-item">
        <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
        <LinkViewer link={proposal.remark} />
      </div>
    </div>
  );
}

export default QDetails;
