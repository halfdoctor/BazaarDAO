import { media } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

export const ParametersBlockTitle = styled.div`
  position: sticky;
  top: 0;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr max-content;
  padding: 24px 0 16px;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};

  ${media.lessThan('tablet')} {
    grid-template-columns: 1fr;
  }

  .parameters-block-title__content {
    display: flex;
    gap: 4px;
  }

  .parameters-switch {
    flex: 1;
    min-width: max-width;
    justify-content: end;

    ${media.lessThan('tablet')} {
      justify-content: start;
    }
  }
`;

export const BlockParagraph = styled.p`
  margin-top: 20px;
`;

export const DocsLink = styled.a`
  cursor: pointer;
  font-size: 14px;
  line-height: 1;

  &,
  &:hover {
    color: inherit;
    text-decoration: none;
  }
`;
