import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Button from 'components/Button';

import { NotFoundContainer } from './styles';

function NotFound () {
  const { t } = useTranslation();
  return (
    <NotFoundContainer>
      <p className="text-xl font-semibold">
        {t('PAGE_DOES_NOT_EXIST')}
      </p>

      <Link to="/">
        <Button
          block
          alwaysEnabled
        >
          <i className="mdi mdi-home" />
          <span>{t('HOME')}</span>
        </Button>
      </Link>
    </NotFoundContainer>
  );
}

export default NotFound;
