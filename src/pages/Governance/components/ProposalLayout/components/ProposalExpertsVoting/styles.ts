import { media } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

export const StyledProposalExpertsVoting = styled.div`
  .proposal-experts-voting__progress {
    margin-top: 8px;
  }

  .proposal-experts-voting__votes {
    margin-top: 24px;
    display: grid;
    gap: 16px;
  }

  .proposal-experts-voting__vote {
    display: grid;
    grid-template-columns: auto 1fr 2fr 3fr;
    gap: 8px;

    ${media.lessThan('medium')} {
      grid-template-columns: auto 2fr 1fr 2fr;
    }
  }

  .proposal-experts-voting__vote-bg {
    width: 8px;
    border-radius: 8px;
  }

  .proposal-experts-voting__vote-val {
    text-align: right;
  }
`;
