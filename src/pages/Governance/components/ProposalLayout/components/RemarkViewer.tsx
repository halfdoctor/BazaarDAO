import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@q-dev/q-ui-kit';
import escape from 'lodash/escape';

import { formatUrl } from 'utils';
import { URL_REGEX } from 'utils/validators';

interface Props {
  remark: string;
}

function parseRemark (remark: string) {
  const escapedRemark = escape(remark) || '-';
  const urlRegex = /https?:\/\/(www\.)?[-äöüa-zA-Z0-9@%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-äöüa-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

  return escapedRemark?.replaceAll(urlRegex, match => `<a class="link" href="${match}" target="_blank" rel="noreferrer noopener"><span>${match}</span></a>`);
}

function RemarkViewer ({ remark }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {URL_REGEX.test(remark)
        ? (
          <>
            <a
              href={formatUrl(remark)}
              target="_blank"
              rel="noreferrer"
              className="link text-md"
              style={{ maxWidth: '100%' }}
            >
              <span className="ellipsis">{remark}</span>
              <Icon name="external-link" />
            </a>
            <p className="text-sm color-secondary">{t('PROPOSAL_LINK_DISCLAIMER')}</p>
          </>
        )
        : <p
          dangerouslySetInnerHTML={{ __html: parseRemark(remark) }}
          className="text-md pre-line"
        />
      }
    </div>
  );
}

export default memo(RemarkViewer);
