import { useTranslation } from 'react-i18next';

import { Icon } from '@q-dev/q-ui-kit';

import useNetworkConfig from 'hooks/useNetworkConfig';

import { ReferencesContainer } from './styles';

function References () {
  const { t } = useTranslation();
  const { docsUrl, constitutionUrl } = useNetworkConfig();

  const referenceLinks = [
    {
      title: t('Q_CONSTITUTION'),
      href: `${constitutionUrl}/constitution/latest`,
    },
    {
      title: t('REPOSITORIES'),
      href: 'https://gitlab.com/q-dev',
    },
    {
      title: t('TUTORIALS'),
      href: docsUrl,
    },
  ];

  return (
    <ReferencesContainer>
      {referenceLinks.map(({ title, href }) => (
        <a
          key={href}
          className="reference-link text-md"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <span className="reference-link-text">{title}</span>
          <Icon name="external-link" className="reference-link-icon" />
        </a>
      ))}
    </ReferencesContainer>
  );
}

export default References;
