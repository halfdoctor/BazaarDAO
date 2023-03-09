import styled from 'styled-components';

export const VotingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  grid-template-columns: repeat(2, 1fr);

  div:nth-child(2) {
    text-align: right;
  }
`;
