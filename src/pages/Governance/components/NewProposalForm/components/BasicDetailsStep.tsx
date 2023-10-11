import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import styled from 'styled-components';
import { NewProposalForm } from 'typings/forms';

import { FormStep } from 'components/MultiStepForm';
import Textarea from 'components/Textarea';

import { useNewProposalForm } from '../NewProposalForm';

import { MAX_FIELD_LENGTH } from 'constants/fields';
import { required } from 'utils/validators';

const BasicDetailsStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function BasicDetailsStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();

  const form = useForm({
    initialValues: {
      remark: ''
    },
    validators: {
      remark: [required],
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
      <BasicDetailsStepContainer>
        <Textarea
          {...form.fields.remark}
          label={t('DESCRIPTION')}
          labelTooltip={t('PROPOSAL_DESCRIPTION_TOOLTIP')}
          placeholder={t('DESCRIPTION')}
          maxLength={MAX_FIELD_LENGTH.proposalRemark}
        />
      </BasicDetailsStepContainer>
    </FormStep>
  );
}

export default BasicDetailsStep;
