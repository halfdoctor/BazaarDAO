
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup } from '@q-dev/q-ui-kit';
import { formatAsset } from '@q-dev/utils';
import { Proposal } from 'typings/proposals';
import { fromWei } from 'web3-utils';

import Button from 'components/Button';

import { StyledVoteForm } from './styles';

import { useBaseVotingWeightInfo, useProposals } from 'store/proposals/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { required } from 'utils/validators';

interface Props {
  proposal: Proposal;
  isMemberVoting?: boolean;
  onSubmit: () => void;
}

function VoteForm ({ proposal, isMemberVoting, onSubmit }: Props) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { voteForProposal } = useProposals();
  const { baseVotingWeightInfo } = useBaseVotingWeightInfo();

  const weight = formatAsset(fromWei(baseVotingWeightInfo.ownWeight), 'Q');

  const form = useForm({
    initialValues: { vote: '' },
    validators: { vote: [required] },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('VOTE_TX'),
        onConfirm: () => onSubmit(),
        submitFn: () => voteForProposal({
          type: 'basic',
          isVotedFor: form.vote === 'yes',
          proposal,
        })
      });
    }
  });

  return (
    <StyledVoteForm
      noValidate
      $selectedOption={form.values.vote === 'yes' ? 'for' : 'against'}
      onSubmit={form.submit}
    >
      {!isMemberVoting &&
        <div>
          <p className="text-md">{t('TOTAL_VOTING_WEIGHT')}</p>
          <p
            className="text-xl font-semibold"
            title={weight}
          >
            {weight}
          </p>
        </div>
      }
      <RadioGroup
        {...form.fields.vote}
        extended
        name="vote"
        options={[
          { label: t('YES'), value: 'yes' },
          { label: t('NO'), value: 'no' },
        ]}
      />

      <Button
        type="submit"
        style={{ width: '100%' }}
        disabled={!form.isValid}
      >
        {t('SUBMIT')}
      </Button>
    </StyledVoteForm>
  );
}

export default VoteForm;
