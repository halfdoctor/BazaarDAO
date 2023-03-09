import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import QFeesMembersTable from 'components/Tables/QFeesMembersTable';

import ParametersBlock from '../ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { getEpqfiParametersInstance } from 'contracts/contract-instance';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;
`;

function QFIParameters () {
  const { t } = useTranslation();
  const {
    epqfiParameters,
    epqfiParametersLoading,
    epqfiParametersError,
    getEpqfiParameters
  } = useParameters();

  const [ePQFIParametersAddress, setEPQFIParametersAddress] = useState('0x00');

  useEffect(() => {
    getEpqfiParameters();
    getEpqfiParametersInstance().then((contract) => setEPQFIParametersAddress(contract.address));

    return () => setEPQFIParametersAddress('0x00');
  }, []);

  return (
    <StyledWrapper>
      <ParametersBlock
        title={t('Q_FEES_INCENTIVES_EXPERT_PANEL_PARAMETERS')}
        subtitle={`(${ePQFIParametersAddress})`}
        docsId="#q-fees-and-incentives-expert-panel-epqfi-parameters"
        parameters={epqfiParameters}
        loading={epqfiParametersLoading}
        errorMsg={epqfiParametersError}
      />

      <QFeesMembersTable />
    </StyledWrapper>
  );
}

export default QFIParameters;
