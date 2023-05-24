import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import styled from 'styled-components';
import { NewProposalForm } from 'typings/forms';

import InfoTooltip from 'components/InfoTooltip';
import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import { ZERO_HASH } from 'constants/boundaries';
import { hash, required, url } from 'utils/validators';

const ConstitutionHashStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;


  .constitution-hash-step__hash-tooltip {
    display: flex;
    margin-bottom: 12px;
  }
`;

function ConstitutionHashStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();

  const form = useForm({
    initialValues: {
      hash: ZERO_HASH,
      externalLink: ''
    },
    validators: {
      hash: [required, hash],
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as NewProposalForm);
    },
  });

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <ConstitutionHashStepContainer>

        <div>
          <div className="constitution-hash-step__hash-tooltip">
            <p className="text-md">
              {t('NEW_CONSTITUTION_HASH')}
            </p>
            <InfoTooltip description={t('NEW_CONSTITUTION_HASH_TOOLTIP')} />
          </div>
          <Input
            {...form.fields.hash}
            placeholder={t('HASH')}
          />
        </div>

        <Input
          {...form.fields.externalLink}
          label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
          placeholder={t('LINK')}
        />
      </ConstitutionHashStepContainer>
    </FormStep>
  );
}

export default ConstitutionHashStep;
