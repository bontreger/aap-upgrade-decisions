import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Nav,
  NavItem,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import MoonIcon from '@patternfly/react-icons/dist/esm/icons/moon-icon';
import SunIcon from '@patternfly/react-icons/dist/esm/icons/sun-icon';
import { useSettings } from '../context/SettingsContext';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode, toggleDarkMode } = useSettings();

  const masthead = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Toggle sidebar"
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setSidebarOpen((o) => !o)}
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand onClick={() => navigate('/')}>
          AAP Upgrade Path Advisor
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Button
          variant="plain"
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav>
          <NavItem
            itemId="wizard"
            isActive={location.pathname === '/'}
            onClick={() => navigate('/')}
          >
            Assessment wizard
          </NavItem>
          <NavItem
            itemId="report"
            isActive={location.pathname === '/report'}
            onClick={() => navigate('/report')}
          >
            Upgrade report
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      <Outlet />
    </Page>
  );
}
