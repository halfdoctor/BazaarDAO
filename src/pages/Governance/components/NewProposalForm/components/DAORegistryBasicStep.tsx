import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import styled from 'styled-components';
import { NewProposalForm } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import { required, url } from 'utils/validators';

const DAORegistryBasicStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function DAORegistryBasicStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();

  const form = useForm({
    initialValues: {
      externalLink: ''
    },
    validators: {
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
      <DAORegistryBasicStepContainer>
        <Input
          {...form.fields.externalLink}
          label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
          labelTooltip={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE_TOOLTIP')}
          placeholder={t('LINK')}
        />
      </DAORegistryBasicStepContainer>
    </FormStep>
  );
}

export default DAORegistryBasicStep;
