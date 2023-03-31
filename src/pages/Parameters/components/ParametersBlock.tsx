import { useTranslation } from 'react-i18next';

import { media, Spinner } from '@q-dev/q-ui-kit';
import styled from 'styled-components';
import { ParameterValue } from 'typings/parameters';

import ParametersTable from './ParametersTable';

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

interface Props {
  title: string;
  subtitle: string;
  parameters: ParameterValue[];
  loading: boolean;
  errorMsg: string;
  emptyMsg?: string;
}

function ParametersBlock ({
  title,
  subtitle,
  parameters = [],
  loading = false,
  errorMsg = '',
  emptyMsg = 'NO_PARAMETERS',
}: Props) {
  const { t } = useTranslation();

  const renderTable = () => {
    if (loading && !parameters.length) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px auto' }}>
          <Spinner size={32} />
        </div>
      );
    }

    return errorMsg || !parameters.length
      ? <BlockParagraph>{errorMsg || t(emptyMsg)}</BlockParagraph>
      : <ParametersTable parameters={parameters} />;
  };

  return (
    <div className="block" style={{ paddingTop: 0 }}>
      <ParametersBlockTitle>
        <div className="parameters-block-title__content">
          <h2 className="text-h3">{title}</h2>
        </div>
      </ParametersBlockTitle>
      <p className="text-md color-secondary ellipsis" title={subtitle}>
        {subtitle}
      </p>
      {renderTable()}
    </div>
  );
}

export default ParametersBlock;
