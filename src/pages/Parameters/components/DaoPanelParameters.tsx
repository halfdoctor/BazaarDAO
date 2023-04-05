import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ParameterValue } from 'typings/parameters';

import ParametersBlock from './ParametersBlock';

import { getParameters } from 'contracts/helpers/parameters-helper';

import { captureError } from 'utils/errors';

interface Props {
  panel: string;
}

function DaoPanelParameters ({ panel }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parameters, setParameters] = useState<ParameterValue[]>([]);

  useEffect(() => {
    loadParameters();
  }, []);

  async function loadParameters () {
    try {
      setLoading(true);
      const parameters = await getParameters(panel);
      setParameters(parameters);
    } catch (error) {
      captureError(error);
      setError(t('PANEL_PARAMETERS_LOADING_ERROR', { panel }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ParametersBlock
      title={t('PANEL_PARAMETERS', { panel })}
      parameters={parameters}
      loading={loading}
      errorMsg={error}
    />
  );
}

export default DaoPanelParameters;
