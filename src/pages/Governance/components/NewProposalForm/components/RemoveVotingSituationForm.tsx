import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { Select } from '@q-dev/q-ui-kit';
import type { DeleteVotingSituationForm } from 'typings/forms';
import { VotingSituation } from 'typings/proposals';

import { required } from 'utils/validators';

interface Props {
  externalPanelSituations: VotingSituation[];
  onChange: (form: Form<DeleteVotingSituationForm>) => void;
}

function RemoveVotingSituationForm ({ onChange, externalPanelSituations }: Props) {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      situationNameForRemoval: '',
    },
    validators: {
      situationNameForRemoval: [required],
    },
  });

  const situationNameOptions = externalPanelSituations.map(({ name }) => ({
    value: name,
    label: name
  }));

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  return (
    <>
      <Select
        {...form.fields.situationNameForRemoval}
        label={t('VOTING_SITUATION_NAME')}
        placeholder={t('NAME')}
        options={situationNameOptions}
      />
    </>
  );
}

export default RemoveVotingSituationForm;
