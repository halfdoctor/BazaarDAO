import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import logo from 'assets/img/logo.png';

import useDao from 'hooks/useDao';

import packageJson from '../../../package.json';

import EcosystemLinks from './components/EcosystemLinks';
import References from './components/References/References';
import SidebarLink from './components/SidebarLink/SidebarLink';
import VersionModal from './components/VersionModal';
import { SidebarContainer } from './styles';

import { useProposals } from 'store/proposals/hooks';

import { RoutePaths } from 'constants/routes';

function Sidebar ({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { activeProposalsCount } = useProposals();
  const { composeDaoLink } = useDao();

  const [versionModalOpen, setVersionModalOpen] = useState(false);

  return (
    <SidebarContainer $open={open}>
      <div className="sidebar-overlay" onClick={onClose} />

      <div className="sidebar" onClick={onClose}>
        <div className="sidebar-content">
          <Link
            to={composeDaoLink('/')}
            className="sidebar-logo-link"
          >
            <img
              className="sidebar-logo"
              alt="Q Logo"
              src={logo}
            />
          </Link>

          <div className="sidebar-main">
            <div className="sidebar-links">
              <SidebarLink
                exact={!pathname.includes('dashboard')}
                to={composeDaoLink('/')}
                title={t('DASHBOARD')}
                icon="dashboard"
              />

              <SidebarLink
                exact={false}
                to={composeDaoLink('/governance')}
                title={t('GOVERNANCE')}
                icon="vote"
                count={activeProposalsCount}
              />
              <SidebarLink
                exact={false}
                to={composeDaoLink(RoutePaths.votingPower)}
                title={t('VOTING_POWER')}
                icon="bank"
              />
            </div>

            <References />
            <EcosystemLinks />
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-link text-md" onClick={() => setVersionModalOpen(true)}>
            {packageJson.version}
          </button>

          <Link to="/privacy" className="sidebar-footer-link text-md">
            {t('DATA_PRIVACY')}
          </Link>

          <Link to="/imprint" className="sidebar-footer-link text-md">
            {t('IMPRINT')}
          </Link>
        </div>

        <VersionModal open={versionModalOpen} onClose={() => setVersionModalOpen(false)} />
      </div>
    </SidebarContainer>
  );
}

export default Sidebar;
