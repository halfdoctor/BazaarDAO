import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { useMultiStepForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Illustration } from '@q-dev/q-ui-kit';
import { CreateProposalForm } from 'typings/forms';

import SpinnerLoading from 'components/Base/SpinnerLoading';
import MultiStepForm from 'components/MultiStepForm';

import useDao from 'hooks/useDao';

import { ListEmptyStub } from '../Proposals/styles';

import ConfirmationStep from './components/ConfirmationStep';
import ConstitutionHashStep from './components/ConstitutionHashStep';
import ConstitutionSituationStep from './components/ConstitutionSituationStep';
import GeneralSituationStep from './components/GeneralSituationStep';
import MembershipSituationStep from './components/MembershipSituationStep';
import ParameterSituationStep from './components/ParameterSituationStep';
import TypeStep from './components/TypeStep';

import { useDaoProposals } from 'store/dao-proposals/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { RoutePaths } from 'constants/routes';

const DEFAULT_VALUES: CreateProposalForm = {
  type: 'constitution',
  currentPanelName: '',
  hash: '',
  candidateAddress: '',
  externalLink: '',
  membershipSituationType: 'add-member',
  generalSituationType: 'raise-topic',
  isParamsChanged: false,
  params: []
};

const CreateProposalContext = createContext(
  {} as ReturnType<typeof useMultiStepForm<typeof DEFAULT_VALUES>>
);

function CreateProposal ({ panelName }: { panelName: string }) {
  const history = useHistory();
  const { t } = useTranslation();
  const { createNewProposal, getPanelSituation } = useDaoProposals();
  const { submitTransaction } = useTransaction();
  const { composeDaoLink } = useDao();
  const [panelSituations, setPanelSituations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPanelSituation = async () => {
    setIsLoading(true);
    const situation = await getPanelSituation(panelName);
    setPanelSituations(situation || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPanelSituation();

    return () => {
      setPanelSituations([]);
    };
  }, [panelName]);

  const form = useMultiStepForm({
    initialValues: DEFAULT_VALUES,
    onConfirm: (form) => {
      submitTransaction({
        successMessage: t('CREATE_PROPOSAL_TX'),
        submitFn: () => createNewProposal(form),
        onSuccess: () => history.push(composeDaoLink(RoutePaths.governance))
      });
    },
  });

  const steps = useMemo(() => {
    return !isLoading && panelSituations.length
      ? [
        {
          id: 'type',
          name: t('PROPOSAL_TYPE'),
          title: t('TYPE_OF_Q_PROPOSAL'),
          children: <TypeStep situations={panelSituations} panelName={panelName} />
        },
        ...(form.values.type === DefaultVotingSituations.GeneralSituation
          ? [{
            id: 'general-situation',
            name: t('DETAILS'),
            title: t('DETAILS'),
            children: <GeneralSituationStep />
          }]
          : []
        ),
        ...(form.values.type === DefaultVotingSituations.ParameterSituation
          ? [{
            id: 'parameter-situation',
            name: t('PARAMETERS'),
            title: t('PARAMETER_VOTE'),
            children: <ParameterSituationStep panelName={panelName} />
          }]
          : []
        ),
        ...(form.values.type === DefaultVotingSituations.MembershipSituation
          ? [{
            id: 'membership-situation',
            name: t('DETAILS'),
            title: t('INTERACTION_WITH_USER'),
            children: <MembershipSituationStep />
          }]
          : []
        ),
        ...(form.values.type === DefaultVotingSituations.ConstitutionSituation
          ? [
            {
              id: 'constitution-situation-1',
              name: t('BASIC_DETAILS'),
              title: t('BASIC_DETAILS'),
              children: <ConstitutionHashStep />
            },
            {
              id: 'constitution-situation-2',
              name: t('PARAMETERS'),
              title: t('CHANGE_OF_CONSTITUTION_PARAMETERS'),
              children: <ConstitutionSituationStep panelName={panelName} />
            },
          ]
          : []
        ),
        {
          id: 'confirm',
          name: t('CONFIRMATION'),
          title: t('CONFIRMATION'),
          tip: t('CONFIRMATION_TIP'),
          children: <ConfirmationStep />
        }
      ]
      : [];
  }, [form.values.type, panelName, isLoading, panelSituations]);

  if (isLoading) {
    return (
      <SpinnerLoading size={60} />
    );
  }

  if (!panelSituations.length) {
    return (
      <ListEmptyStub>
        <Illustration type="empty-list" />
        <p className="text-lg font-semibold">{t('NO_SITUATIONS_FOUND')}</p>
      </ListEmptyStub>
    );
  }

  return (
    <CreateProposalContext.Provider value={form}>
      <MultiStepForm stepIndex={form.stepIndex} steps={steps} />
    </CreateProposalContext.Provider>
  );
}

export const useCreateProposalForm = () => useContext(CreateProposalContext);

export default CreateProposal;
