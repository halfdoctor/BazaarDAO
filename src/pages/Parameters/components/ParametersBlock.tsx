import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { media, Spinner, Switch } from '@q-dev/q-ui-kit';
import styled from 'styled-components';
import { ParameterValue } from 'typings/parameters';

import EmptyListViewer from 'components/EmptyListViewer';

import ParametersTable from './ParametersTable';

export const StyledWrapper = styled.div`
  padding-top: 0;

  .parameters-block__title {
    padding: 24px 0 16px;
    display: flex;
    justify-content: space-between;
    
    ${media.lessThan('medium')} {
      flex-direction: column;
      gap: 16px;
    }
  }

  .parameters-block__switch-wrap {
    width: 100%;
    display: flex;
    justify-content: flex-end;

    ${media.lessThan('medium')} {
      justify-content: flex-start;
    }
  }

  .parameters-block__loading-wrp {
    display: flex;
    justify-content: center;
    margin: 24px auto;
  }
`;

interface GeneralProps {
  title: string;
  parameters: ParameterValue[];
  loading: boolean;
  errorMsg: string;
  emptyMsg?: string;
}

type Props<T = ((val: boolean) => void) | undefined> = T extends undefined
  ? GeneralProps & { setIsRegularParams?: T }
  : GeneralProps & { setIsRegularParams: T; isRegularParams: boolean};

function ParametersBlock (props: Props) {
  const { t } = useTranslation();
  const [isSimplified, setIsSimplified] = useState(true);

  return (
    <StyledWrapper className="block">
      <div className="text-h3 parameters-block__title">
        <h2>{props.title}</h2>
        {props.setIsRegularParams
          ? (<Switch
            label={t('SHOW_REGULAR_PARAMS')}
            value={props.isRegularParams}
            onChange={(val: boolean) => {
              props.setIsRegularParams(val);
              setIsSimplified(!val);
            }}
          />)
          : (<Switch
            label={t('SIMPLIFIED_VIEW')}
            value={isSimplified}
            onChange={setIsSimplified}
          />)
        }
      </div>
      {!!props.setIsRegularParams && !props.isRegularParams && (
        <div className="parameters-block__switch-wrap">
          <Switch
            label={t('SIMPLIFIED_VIEW')}
            value={isSimplified}
            onChange={setIsSimplified}
          />
        </div>
      )}

      {props.loading && !props.parameters.length
        ? (
          <div className="parameters-block__loading-wrp">
            <Spinner size={32} />
          </div>
        )
        : props.errorMsg || !props.parameters.length
          ? <EmptyListViewer message={props.errorMsg || t('NO_PARAMETERS')} />
          : <ParametersTable
            parameters={props.parameters}
            simplified={isSimplified}
          />
      }
    </StyledWrapper>
  );
}

export default ParametersBlock;
