import { useTranslation } from 'react-i18next';

import { Spinner } from '@q-dev/q-ui-kit';
import styled from 'styled-components';
import { ParameterValue } from 'typings/parameters';

import EmptyListViewer from 'components/EmptyListViewer';

import ParametersTable from './ParametersTable';

export const StyledWrapper = styled.div`
  padding-top: 0;

  .parameters-block__title {
    padding: 24px 0 16px;
  }

  .parameters-block__loading-wrp {
    display: flex;
    justify-content: center;
    margin: 24px auto;
  }
`;

interface Props {
  title: string;
  parameters: ParameterValue[];
  loading: boolean;
  errorMsg: string;
  emptyMsg?: string;
}

function ParametersBlock ({
  title,
  parameters = [],
  loading = false,
  errorMsg = '',
}: Props) {
  const { t } = useTranslation();

  return (
    <StyledWrapper className="block">
      <h2 className="text-h3 parameters-block__title">
        {title}
      </h2>

      {loading && !parameters.length
        ? (
          <div className="parameters-block__loading-wrp">
            <Spinner size={32} />
          </div>
        )
        : errorMsg || !parameters.length
          ? <EmptyListViewer message={errorMsg || t('NO_PARAMETERS')} />
          : <ParametersTable parameters={parameters} />
      }
    </StyledWrapper>
  );
}

export default ParametersBlock;
