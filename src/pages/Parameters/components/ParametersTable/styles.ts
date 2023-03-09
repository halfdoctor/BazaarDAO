import styled, { css } from 'styled-components';

export const TableWrapper = styled.div<{ $simplified: boolean }>`
  overflow-x: auto;
  
  table {
    width: 100%;
  }

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  td {
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 13px;
    line-height: 18px;
    padding: 7px 5px;
    white-space: ${({ $simplified }) => $simplified ? 'normal' : 'nowrap'};

    ${({ $simplified }) => $simplified && css`
      &:first-child {
        font-weight: 600;
      }
    `}
  }

  .parameter-key-cell {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .parameter-key-copy {
    padding: 0;
  }
`;
