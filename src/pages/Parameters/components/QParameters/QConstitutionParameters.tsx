import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ParametersBlock from '../ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { getConstitutionInstance } from 'contracts/contract-instance';

function QConstitutionParameters () {
  const { t } = useTranslation();
  const {
    constitutionParameters,
    constitutionParametersLoading,
    constitutionParametersError,
    getConstitutionParameters
  } = useParameters();

  const [constitutionParametersAddress, setConstitutionParametersAddress] = useState('0x00');

  useEffect(() => {
    getConstitutionParameters();
    getConstitutionInstance().then((contract) => setConstitutionParametersAddress(contract.address));

    return () => {
      setConstitutionParametersAddress('0x00');
    };
  }, []);

  return (
    <ParametersBlock
      title={t('Q_CONSTITUTION_PARAMETERS')}
      subtitle={`(${constitutionParametersAddress})`}
      docsId="#q-constitution-parameters"
      parameters={constitutionParameters}
      loading={constitutionParametersLoading}
      errorMsg={constitutionParametersError}
    />
  );
}

export default QConstitutionParameters;
