import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { CreateProposalForm, MembershipSituationType } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useCreateProposalForm } from '../CreateProposal';

import { address, required, url } from 'utils/validators';

function MembershipSituationStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useCreateProposalForm();

  const form = useForm({
    initialValues: {
      membershipSituationType: 'add-member' as MembershipSituationType,
      candidateAddress: '',
      externalLink: '',
    },
    validators: {
      membershipSituationType: [required],
      externalLink: [required, url],
      candidateAddress: [required, address],
    },
    onSubmit: (form) => goNext(form as CreateProposalForm),
  });

  const panelTypeOptions: RadioOptions<MembershipSituationType> = [
    {
      value: 'add-member',
      label: t('ADD_NEW_MEMBER')
    },
    {
      value: 'remove-member',
      label: t('REMOVE_MEMBER'),
    }
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.membershipSituationType}
        name="param-panel-type"
        options={panelTypeOptions}
      />
      <Input
        {...form.fields.candidateAddress}
        label={t('CANDIDATE_ADDRESS')}
        placeholder={t('ADDRESS_PLACEHOLDER')}
      />
      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default MembershipSituationStep;
