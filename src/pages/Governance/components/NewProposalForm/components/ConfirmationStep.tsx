import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';

import CreateVotingSituationViewer from 'components/CreateVotingSituationViewer';
import DecodedCallDataViewer from 'components/DecodedCallDataViewer';
import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import ParameterViewer from 'components/ParameterViewer';

import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

import { GENERAL_SITUATION_TYPE_TRANSLATION_KEY_MAP } from 'constants/proposal';

interface Props {
  abi?: string[];
  isExternalSituation?: boolean;
}

function ConfirmationStep ({ abi, isExternalSituation }: Props) {
  const { t } = useTranslation();
  const { values, goBack, confirm, updateStep } = useNewProposalForm();
  const { proposalOptionsMap } = useProposalSteps();

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
          {proposalOptionsMap[values.type]?.label || values.type}
        </p>
      </FormBlock>

      {values.type === DefaultVotingSituations.Constitution && (
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
            <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
            <p className="text-lg pre-line">{values.remark}</p>
          </div>
        </FormBlock>
      )}

      {(values.type === DefaultVotingSituations.Constitution ||
        values.type === DefaultVotingSituations.ConfigurationParameter ||
        values.type === DefaultVotingSituations.RegularParameter) &&
        (
          <FormBlock
            icon="edit"
            title={t('PARAMETERS')}
            onAction={() => updateStep(values.type === DefaultVotingSituations.Constitution ? 2 : 1)}
          >
            {values.type === DefaultVotingSituations.Constitution && (
              <div>
                <p className="text-md color-secondary">
                  {t('CHANGE_CONSTITUTION_PARAMETER')}
                </p>
                <p className="text-lg">
                  {values.isParamsChanged ? t('YES') : t('NO')}
                </p>
              </div>
            )}

            <div>
              <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
              <p className="text-lg pre-line">{values.remark}</p>
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

      {values.type === DefaultVotingSituations.General && (
        <FormBlock
          icon="edit"
          title={t('DETAILS')}
          onAction={() => updateStep(1)}
        >
          <div>
            <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
            <p className="text-lg pre-line">{values.remark}</p>
          </div>

          <div>
            <p className="text-md color-secondary">{t('TYPE')}</p>
            <p className="text-lg pre-line">
              {t(GENERAL_SITUATION_TYPE_TRANSLATION_KEY_MAP[values.generalSituationType])}
            </p>
          </div>

          {values.generalSituationType === 'remove-voting' && (
            <div>
              <p className="text-md color-secondary">{t('VOTING_SITUATION_NAME')}</p>
              <p className="text-lg pre-line">{values.situationNameForRemoval}</p>
            </div>
          )}

          {values.generalSituationType === 'create-voting' && values.newVotingSituation && (
            <CreateVotingSituationViewer situationsParams={values.newVotingSituation} />
          )}

        </FormBlock>)}

      {values.type === DefaultVotingSituations.Membership && (
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
            <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
            <p className="text-lg pre-line">{values.remark}</p>
          </div>
        </FormBlock>)}
      {(values.type === DefaultVotingSituations.DAORegistry ||
        values.type === DefaultVotingSituations.PermissionManager) && (
        <>
          <FormBlock
            icon="edit"
            title={t('BASIC_PART')}
            onAction={() => updateStep(1)}
          >
            <div>
              <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
              <p className="text-lg pre-line">{values.remark}</p>
            </div>
          </FormBlock>
          <FormBlock
            icon="edit"
            title={t('DETAILS')}
            onAction={() => updateStep(2)}
          >
            {values.callData.map((callData, index) => (
              <DecodedCallDataViewer
                key={index}
                scheme="top-border"
                callData={callData}
                index={index + 1}
                votingSituation={values.type}
                abi={abi}
              />
            ))}
          </FormBlock>
        </>
      )}
      {Boolean(isExternalSituation) && (
        <FormBlock
          icon="edit"
          title={t('DETAILS')}
          onAction={() => updateStep(1)}
        >
          <div>
            <p className="text-md color-secondary">{t('DESCRIPTION')}</p>
            <p className="text-lg pre-line">{values.remark}</p>
          </div>
          {values.callData.map((callData, index) => (
            <DecodedCallDataViewer
              key={index}
              withoutHeader
              callData={callData}
              votingSituation={values.type}
              abi={abi}
            />
          ))}
        </FormBlock>
      )}
    </FormStep>
  );
}

export default ConfirmationStep;
