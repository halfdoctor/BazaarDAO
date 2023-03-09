import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import EprsMembersTable from 'components/Tables/EprsMembersTable';

import ParametersBlock from '../ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { getEprsParametersInstance } from 'contracts/contract-instance';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;
`;

function QEPRSParameters () {
  const { t } = useTranslation();
  const {
    eprsParameters,
    eprsParametersLoading,
    eprsParametersError,
    getEprsParameters
  } = useParameters();

  const [ePRSParametersAddress, setEPRSParametersAddress] = useState('0x00');

  useEffect(() => {
    getEprsParameters();
    getEprsParametersInstance().then((contract) => setEPRSParametersAddress(contract.address));

    return () => setEPRSParametersAddress('0x00');
  }, []);

  return (
    <StyledWrapper>
      <ParametersBlock
        title={t('Q_ROOT_NODE_SELECTION_EXPERT_PANEL_PARAMETERS')}
        subtitle={`(${ePRSParametersAddress})`}
        parameters={eprsParameters}
        loading={eprsParametersLoading}
        errorMsg={eprsParametersError}
      />

      <EprsMembersTable />
    </StyledWrapper>
  );
}

export default QEPRSParameters;
