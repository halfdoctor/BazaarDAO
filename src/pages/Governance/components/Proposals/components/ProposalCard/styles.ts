import { Link } from 'react-router-dom';

import styled from 'styled-components';

export const ProposalCardLink = styled(Link)`
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};
  transition: all 150ms ease-out;

  &:hover,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderMain};
  }

  .proposal-card__head {
    display: flex;
    justify-content: space-between;
  }

  .proposal-card__id {
    display: flex;
    gap: 8px;
  }

  .proposal-card__title {
    margin-top: 12px;
  }

  .proposal-card__voting {
    margin-top: 16px;
  }

  .proposal-card__quorum {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
  }

  .proposal-card__progress {
    margin-top: 8px;
  }

  .proposal-card__periods {
    margin-top: 20px;
  }
`;
