import { useRef } from 'react';
import { useTranslation, } from 'react-i18next';

import { useFormArray } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Icon } from '@q-dev/q-ui-kit';
import { CallDataProposalForm, FormValidatesMap } from 'typings/forms';

import Button from 'components/Button';
import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import CallDataForm from './CallDataForm';

import { DAO_REGISTRY_AVAILABLE_FUNCTIONS, PERMISSION_MANAGER_AVAILABLE_FUNCTIONS } from 'constants/proposal';

interface Props {
  situation: string;
  abi?: string[];
  maxFormCount?: number;
}

const MAX_UPGRADES_COUNT = 10;

const AVAILABLE_SITUATIONS_INFO_MAP = {
  [DefaultVotingSituations.DAORegistry as string]: {
    titleKey: 'UPGRADE_INDEX',
    abi: DAO_REGISTRY_AVAILABLE_FUNCTIONS as string[]
  },
  [DefaultVotingSituations.PermissionManager as string]: {
    titleKey: 'PERMISSION_INDEX',
    abi: PERMISSION_MANAGER_AVAILABLE_FUNCTIONS as string[]
  },
};

function getSituationInfo (situationName: string, externalAbi?: string[]) {
  const availableSituationInfo = AVAILABLE_SITUATIONS_INFO_MAP[situationName];
  if (availableSituationInfo) return availableSituationInfo;
  if (!externalAbi?.length) return null;

  return {
    abi: externalAbi,
    titleKey: 'UPDATE_INDEX',
  };
}

function CallDataStep ({ situation, abi, maxFormCount = MAX_UPGRADES_COUNT }: Props) {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();
  const formValidatesMap = useRef<FormValidatesMap>({});
  const isSingleForm = maxFormCount <= 1;

  const formArray = useFormArray<CallDataProposalForm>({
    minCount: 1,
    maxCount: maxFormCount,
    onSubmit: (forms) => {
      goNext({ callData: forms.map(i => i.callData) });
    },
  });

  const handleSubmit = () => {
    const isChildFieldsValid = Object.values(formValidatesMap.current)
      .map(validate => validate())
      .every(i => i);
    if (!isChildFieldsValid || !formArray.validate()) return;
    formArray.submit();
  };

  const situationsInfo = getSituationInfo(situation, abi);
  if (!situationsInfo) return null;

  return (
    <FormStep
      onNext={handleSubmit}
      onBack={goBack}
    >

      {formArray.forms.map((form, i) => (
        <FormBlock
          key={form.id}
          title={isSingleForm ? undefined : t(situationsInfo.titleKey, { index: i + 1 }) }
          icon={formArray.forms.length > 1 ? 'delete' : undefined}
          block={!isSingleForm}
          onAction={() => formArray.removeForm(form.id)}
        >
          <CallDataForm
            key={form.id}
            abi={situationsInfo.abi}
            formValidatesMap={formValidatesMap}
            formId={form.id}
            onChange={form.onChange}
          />
        </FormBlock>
      ))}

      {formArray.forms.length < maxFormCount && (
        <Button
          look="ghost"
          onClick={formArray.appendForm}
        >
          <Icon name="add" />
          <span>{t('ADD_UPGRADE')}</span>
        </Button>
      )}
    </FormStep>
  );
}

export default CallDataStep;
