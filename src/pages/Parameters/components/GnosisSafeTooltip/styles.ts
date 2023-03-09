import styled from 'styled-components';

export const TooltipContent = styled.div`
  .tooltip-address {
    display: inline-flex;
    font-weight: 600;
    margin-left: 4px;
  }

  .tooltip-link {
    display: flex;
    margin-top: 4px;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;
