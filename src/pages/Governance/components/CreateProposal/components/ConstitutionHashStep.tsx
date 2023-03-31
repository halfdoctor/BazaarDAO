import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { CreateProposalForm } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useCreateProposalForm } from '../CreateProposal';

import { hash, required, url } from 'utils/validators';

function ConstitutionHashStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useCreateProposalForm();

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
      goNext(form as CreateProposalForm);
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
