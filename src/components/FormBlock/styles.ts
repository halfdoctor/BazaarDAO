import styled, { css } from 'styled-components';

export const StyledFormBlock = styled.div<{ $disabled: boolean; $block?: boolean}>`
  position: relative;

  ${({ $block, $disabled, theme }) => $block && css`
    padding: 24px;
    border-radius: 8px;
    border: 1px solid ${$disabled
      ? theme.colors.disableSecondary
      : theme.colors.borderSecondary
    }; 
  `};

  .form-block__edit-btn {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .form-block__title {
    margin-bottom: 16px;
  }

  .form-block__content {
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr);
  }

  ${({ theme, $disabled }) => $disabled && css`
    .form-block__title {
      color: ${theme.colors.disableSecondary};
    }
  `};
`;
