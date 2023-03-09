
import { useTranslation } from 'react-i18next';

import { ExpertProposalForm } from 'typings/forms';

import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import ParameterViewer from 'components/ParameterViewer';

import { useNewExpertProposal } from '../NewExpertProposal';

function ConfirmationStep () {
  const { t } = useTranslation();
  const { values, goBack, confirm, updateStep } = useNewExpertProposal();

  const proposalTypeMap: Record<ExpertProposalForm['type'], string> = {
    'add-expert': t('ADD_EXPERT'),
    'remove-expert': t('REMOVE_EXPERT'),
    'parameter-vote': t('PARAMETER_VOTE')
  };

  const expertPanelMap: Record<ExpertProposalForm['panelType'], string> = {
    defi: t('Q_DEFI_MEMBERSHIP_PANEL'),
    'fees-incentives': t('Q_FEES_INCENTIVES_MEMBERSHIP_PANEL'),
    'root-node': t('Q_ROOT_NODE_SELECTION_EXPERT_PANEL')
  };

  return (
    <FormStep
      onConfirm={confirm}
      onBack={goBack}
    >
      <FormBlock
        icon="edit"
        title={t('PROPOSAL_TYPE')}
        onAction={() => updateStep(0)}
      >
        <p className="text-lg">
          {proposalTypeMap[values.type]}
        </p>
      </FormBlock>

      {values.type === 'parameter-vote'
        ? (
          <FormBlock
            icon="edit"
            title={t('PARAMETERS')}
            onAction={() => updateStep(1)}
          >
            <div>
              <p className="text-md color-secondary">{t('EXPERT_PANEL')}</p>
              <p className="text-lg">{expertPanelMap[values.panelType]}</p>
            </div>

            <div>
              <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
              <p className="text-lg ellipsis">{values.externalLink}</p>
            </div>

            {values.params.map((param, index) => (
              <ParameterViewer
                key={index + param.key}
                parameter={param}
                index={index}
              />
            ))}
          </FormBlock>
        )
        : (
          <FormBlock
            icon="edit"
            title={values.type === 'add-expert' ? t('ADD_EXPERT') : t('REMOVE_EXPERT')}
            onAction={() => updateStep(1)}
          >
            <div>
              <p className="text-md color-secondary">{t('EXPERT_PANEL')}</p>
              <p className="text-lg">{expertPanelMap[values.panelType]}</p>
            </div>

            <div>
              <p className="text-md color-secondary">{t('CANDIDATE_Q_ADDRESS')}</p>
              <p className="text-lg ellipsis">{values.address}</p>
            </div>

            <div>
              <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
              <p className="text-lg ellipsis">{values.externalLink}</p>
            </div>
          </FormBlock>
        )}
    </FormStep>
  );
}

export default ConfirmationStep;
