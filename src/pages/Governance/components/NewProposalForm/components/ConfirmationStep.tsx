import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';

import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import ParameterViewer from 'components/ParameterViewer';

import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

function ConfirmationStep () {
  const { t } = useTranslation();
  const { values, goBack, confirm, updateStep } = useNewProposalForm();
  const { proposalSteps } = useProposalSteps();
  const proposalType = proposalSteps.find(item => item.value === values.type);

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
          {proposalType?.label}
        </p>
      </FormBlock>

      {values.type === DefaultVotingSituations.ConstitutionSituation && (
        <FormBlock
          icon="edit"
          title={t('BASIC_PART')}
          onAction={() => updateStep(1)}
        >
          <div>
            <p className="text-md color-secondary">{t('HASH')}</p>
            <p className="text-lg ellipsis">{values.hash}</p>
          </div>

          <div>
            <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
            <p className="text-lg ellipsis">{values.externalLink}</p>
          </div>
        </FormBlock>
      )}

      {(values.type === DefaultVotingSituations.ConstitutionSituation ||
        values.type === DefaultVotingSituations.ConfigurationParameterSituation ||
        values.type === DefaultVotingSituations.RegularParameterSituation) &&
        (
          <FormBlock
            icon="edit"
            title={t('PARAMETERS')}
            onAction={() => updateStep(values.type === DefaultVotingSituations.ConstitutionSituation ? 2 : 1)}
          >
            <div>
              <p className="text-md color-secondary">
                {t('CHANGE_CONSTITUTION_PARAMETER')}
              </p>
              <p className="text-lg">
                {values.isParamsChanged ? t('YES') : t('NO')}
              </p>
            </div>

            {values.params.map((param, index) => (
              <ParameterViewer
                key={index + param.key}
                parameter={param}
                index={index}
              />
            ))}
          </FormBlock>
        )}

      {values.type === DefaultVotingSituations.GeneralSituation && (
        <FormBlock
          icon="edit"
          title={t('DETAILS')}
          onAction={() => updateStep(1)}
        >
          <div>
            <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
            <p className="text-lg ellipsis">{values.externalLink}</p>
          </div>
        </FormBlock>)}

      {values.type === DefaultVotingSituations.MembershipSituation && (
        <FormBlock
          icon="edit"
          title={t('DETAILS')}
          onAction={() => updateStep(1)}
        >
          <div>
            <p className="text-md color-secondary">{t('ACTION_TYPE')}</p>
            <p className="text-lg ellipsis">
              {values.membershipSituationType === 'add-member' ? t('ADD_NEW_MEMBER') : t('REMOVE_MEMBER')}
            </p>
          </div>
          <div>
            <p className="text-md color-secondary">{t('CANDIDATE_ADDRESS')}</p>
            <p className="text-lg ellipsis">{values.candidateAddress}</p>
          </div>
          <div>
            <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
            <p className="text-lg ellipsis">{values.externalLink}</p>
          </div>
        </FormBlock>)}
    </FormStep>
  );
}

export default ConfirmationStep;
