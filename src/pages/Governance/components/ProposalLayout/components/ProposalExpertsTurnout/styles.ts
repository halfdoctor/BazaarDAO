import styled from 'styled-components';

export const StyledProposalExpertsTurnout = styled.div`
  .proposal-experts-turnout__quorum {
    display: flex;
    justify-content: space-between;
  }

  .proposal-experts-turnout__progress {
    margin-top: 8px;
  }

  .proposal-experts-turnout__votes {
    margin-top: 24px;
    display: grid;
    gap: 16px;
  }

  .proposal-experts-turnout__vote {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .proposal-experts-turnout__votes-val {
    text-align: right;
  }
`;
