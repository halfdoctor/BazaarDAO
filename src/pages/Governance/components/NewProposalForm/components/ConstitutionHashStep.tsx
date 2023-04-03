import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { NewProposalForm } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import { hash, required, url } from 'utils/validators';

function ConstitutionHashStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();

  const form = useForm({
    initialValues: {
      hash: '',
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
      <Input
        {...form.fields.hash}
        label={t('NEW_CONSTITUTION_HASH')}
        placeholder={t('HASH')}
      />

      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default ConstitutionHashStep;
