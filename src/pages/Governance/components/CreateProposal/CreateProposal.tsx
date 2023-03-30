import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { useMultiStepForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Classification } from '@q-dev/q-js-sdk';
import { QProposalForm } from 'typings/forms';

import MultiStepForm from 'components/MultiStepForm';

import useDao from 'hooks/useDao';

import ConfirmationStep from './components/ConfirmationStep';
import ConstitutionSituationStep from './components/ConstitutionSituationStep';
import GeneralSituationStep from './components/GeneralSituationStep';
import MembershipSituationStep from './components/MembershipSituationStep';
import ParameterSituationStep from './components/ParameterSituationStep';
import TypeStep from './components/TypeStep';

import { useDaoProposals } from 'store/dao-proposals/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { RoutePaths } from 'constants/routes';

const DEFAULT_VALUES: QProposalForm = {
  type: 'constitution',
  generalSituationType: 'raise-topic',
  membershipSituationType: 'add-member',
  classification: Classification.BASIC,
  hash: '',
  candidateAddress: '',
  externalLink: '',
  isParamsChanged: false,
  params: []
};

const CreateProposalContext = createContext(
  {} as ReturnType<typeof useMultiStepForm<typeof DEFAULT_VALUES>>
);

function CreateProposal ({ panelName, panelSituations }: { panelName: string; panelSituations: string[] }) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { composeDaoLink } = useDao();
  const { createNewProposal } = useDaoProposals();
  const history = useHistory();

  const form = useMultiStepForm({
    initialValues: DEFAULT_VALUES,
    onConfirm: (form) => {
      submitTransaction({
        successMessage: t('CREATE_PROPOSAL_TX'),
        submitFn: () => createNewProposal(form),
        onSuccess: () => history.push(composeDaoLink(RoutePaths.qProposals))
      });
    },
  });

  const steps = useMemo(() => {
    return [
      {
        id: 'type',
        name: t('PROPOSAL_TYPE'),
        title: t('TYPE_OF_Q_PROPOSAL'),
        children: <TypeStep situations={panelSituations} />
      },
      ...(form.values.type === DefaultVotingSituations.GeneralSituation
        ? [{
          id: 'general-situation',
          name: t('GENERAL_SITUATION'),
          title: t('GENERAL_SITUATION'),
          children: <GeneralSituationStep />
        }]
        : []
      ),
      ...(form.values.type === DefaultVotingSituations.ParameterSituation
        ? [{
          id: 'parameter-situation',
          name: t('PARAMETERS'),
          title: t('CHANGE_OF_CONSTITUTION_PARAMETERS'),
          children: <ParameterSituationStep />
        }]
        : []
      ),
      ...(form.values.type === DefaultVotingSituations.MembershipSituation
        ? [{
          id: 'membership-situation',
          name: t('PARAMETERS'),
          title: t('CHANGE_OF_CONSTITUTION_PARAMETERS'),
          children: <MembershipSituationStep />
        }]
        : []
      ),
      ...(form.values.type === DefaultVotingSituations.ConstitutionSituation
        ? [{
          id: 'constitution-situation',
          name: t('PARAMETERS'),
          title: t('CHANGE_OF_CONSTITUTION_PARAMETERS'),
          children: <ConstitutionSituationStep />
        }]
        : []
      ),
      {
        id: 'confirm',
        name: t('CONFIRMATION'),
        title: t('CONFIRMATION'),
        tip: t('CONFIRMATION_TIP'),
        children: <ConfirmationStep />
      }
    ];
  }, [form.values.type, panelName]);

  return (
    <CreateProposalContext.Provider value={form}>
      <MultiStepForm stepIndex={form.stepIndex} steps={steps} />
    </CreateProposalContext.Provider>
  );
}

export const useCreateProposalForm = () => useContext(CreateProposalContext);

export default CreateProposal;
