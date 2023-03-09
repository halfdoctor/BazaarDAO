import { useTranslation } from 'react-i18next';

import { Proposal } from 'typings/proposals';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

import LinkViewer from '../../LinkViewer';

import { ZERO_ADDRESS } from 'constants/boundaries';

interface Props {
  proposal: Proposal;
}

function ExpertDetails ({ proposal }: Props) {
  const { t } = useTranslation();

  const isExpertAdded = proposal.addressToAdd && proposal.addressToAdd !== ZERO_ADDRESS;
  const isExpertRemoved = proposal.addressToRemove && proposal.addressToRemove !== ZERO_ADDRESS;

  return (
    <div className="details-list-item">
      {isExpertAdded && (
        <div className="details-item">
          <p className="text-md color-secondary">{t('EXPERT_TO_ADD')}</p>
          <ExplorerAddress
            iconed
            short
            className="text-md"
            address={proposal.addressToAdd}
          />
        </div>
      )}

      {isExpertRemoved && (
        <div className="details-item">
          <p className="text-md color-secondary">{t('EXPERT_TO_REMOVE')}</p>
          <ExplorerAddress
            iconed
            short
            className="text-md"
            address={proposal.addressToRemove}
          />
        </div>
      )}

      <div className="details-item">
        <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
        <LinkViewer link={proposal.remark} />
      </div>
    </div>
  );
}

export default ExpertDetails;
