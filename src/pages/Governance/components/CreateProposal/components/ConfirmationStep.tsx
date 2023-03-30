import { useTranslation } from 'react-i18next';

import { Classification } from '@q-dev/q-js-sdk';

import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import ParameterViewer from 'components/ParameterViewer';

import { useCreateProposalForm } from '../CreateProposal';

function ConfirmationStep () {
  const { t } = useTranslation();
  const { values, goBack, confirm, updateStep } = useCreateProposalForm();
  const isConstitutionType = values.type === 'constitution';

  const classificationMap: Record<Classification, string> = {
    [Classification.BASIC]: t('BASIC_PART'),
    [Classification.DETAILED]: t('DETAILED_PART'),
    [Classification.FUNDAMENTAL]: t('FUNDAMENTAL_PART')
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
          Type
        </p>
      </FormBlock>

      {isConstitutionType
        ? (
          <FormBlock
            icon="edit"
            title={t('BASIC_PART')}
            onAction={() => updateStep(1)}
          >
            <div>
              <p className="text-md color-secondary">{t('CLASSIFICATION')}</p>
              <p className="text-lg">
                {classificationMap[values.classification]}
              </p>
            </div>

            <div>
              <p className="text-md color-secondary">{t('HASH')}</p>
              <p className="text-lg ellipsis">{values.hash}</p>
            </div>

            <div>
              <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
              <p className="text-lg ellipsis">{values.externalLink}</p>
            </div>
          </FormBlock>
        )
        : (
          <FormBlock
            icon="edit"
            title={t('DETAILS')}
            onAction={() => updateStep(1)}
          >
            <div>
              <p className="text-md color-secondary">{t('EXTERNAL_SOURCE')}</p>
              <p className="text-lg ellipsis">{values.externalLink}</p>
            </div>
          </FormBlock>
        )
      }

      {isConstitutionType && (
        <FormBlock
          icon="edit"
          title={t('PARAMETERS')}
          onAction={() => updateStep(2)}
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
    </FormStep>
  );
}

export default ConfirmationStep;
