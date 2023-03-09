import { useTranslation } from 'react-i18next';

import { Proposal } from 'typings/proposals';

import ParameterViewer from 'components/ParameterViewer';

interface Props {
  proposal: Proposal;
}

function ProposalParameters ({ proposal }: Props) {
  const { t } = useTranslation();

  return (
    <div className="block">
      <h2 className="text-h2">{t('PARAMETERS')}</h2>

      <div className="block__content">
        <div className="details-list">
          {proposal.parameters.map((parameter, i) => (
            <ParameterViewer
              key={i}
              block
              parameter={parameter}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProposalParameters;
