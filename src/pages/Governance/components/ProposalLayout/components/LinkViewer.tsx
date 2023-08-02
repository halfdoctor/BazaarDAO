import { useTranslation } from 'react-i18next';

import { Icon } from '@q-dev/q-ui-kit';

import { formatUrl } from 'utils';
import { URL_REGEX } from 'utils/validators';

interface Props {
  link: string;
}

function LinkViewer ({ link }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {URL_REGEX.test(link)
        ? (
          <a
            href={formatUrl(link)}
            target="_blank"
            rel="noreferrer"
            className="link text-md"
            style={{ maxWidth: '100%' }}
          >
            <span className="ellipsis">{link}</span>
            <Icon name="external-link" />
          </a>
        )
        : <p className="text-md">{link || '–'}</p>
      }

      {link && (
        <p className="text-sm color-secondary">{t('PROPOSAL_LINK_DISCLAIMER')}</p>
      )}
    </div>
  );
}

export default LinkViewer;
