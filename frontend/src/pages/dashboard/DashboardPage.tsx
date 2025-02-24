import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUser,
  FaCar,
  FaHeart,
  FaEnvelope,
  FaChartLine,
  FaShieldAlt,
  FaCog,
  FaBars,
  FaTimes,
  FaArrowLeft
} from 'react-icons/fa';
import { SavedItems } from '../../components/dashboard/SavedItems';
import { MessagesPage } from './MessagesPage';
import { MyListings } from '../../components/dashboard/MyListings';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { ProfileSettings } from '../../components/dashboard/ProfileSettings';
import { SecuritySettings } from '../../components/dashboard/SecuritySettings';
import { Preferences } from '../../components/dashboard/Preferences';
import { Analytics } from '../../components/dashboard/Analytics';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  position: relative;
`;

const DesktopSidebar = styled.div`
  width: 280px;
  background: ${props => props.theme.colors.background.paper};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: 24px 0;
  display: none;

  @media (min-width: 1024px) {
    display: block;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
`;

const MobileSidebar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: ${props => props.theme.colors.background.paper};
  z-index: 1000;
  padding: 24px 0;
  overflow-y: auto;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 24px;
  width: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.border};

  @media (min-width: 1024px) {
    padding: 32px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 28px;
  }
`;

const BackButton = styled(motion.button)`
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.default};
    transform: translateX(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 16px;
  }

  @media (min-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 24px;
  background: ${props => props.theme.colors.background.default};

  @media (min-width: 1024px) {
    padding: 32px;
  }
`;

const MobileNavToggle = styled(motion.button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const NavSectionDesktop = styled.div`
  margin-bottom: 32px;
`;

const NavTitleDesktop = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 24px 16px;
  opacity: 0.6;
`;

const NavItemDesktop = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  background: ${props => props.active ? props.theme.colors.primary + '15' : 'transparent'};
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.primary + '15'};
    color: ${props => props.theme.colors.primary};
    transform: translateX(4px);
  }

  svg {
    font-size: 1.25rem;
    opacity: ${props => props.active ? 1 : 0.7};
  }
`;

type Tab = 'overview' | 'profile' | 'listings' | 'saved' | 'messages' | 'analytics' | 'security' | 'preferences';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>((location.state as any)?.activeTab || 'overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const renderDesktopNavItems = () => (
    <>
      <NavSectionDesktop>
        <NavTitleDesktop>Dashboard</NavTitleDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('overview')}
          active={activeTab === 'overview'}
        >
          <FaTachometerAlt /> Overview
        </NavItemDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('profile')}
          active={activeTab === 'profile'}
        >
          <FaUser /> Profile
        </NavItemDesktop>
      </NavSectionDesktop>

      <NavSectionDesktop>
        <NavTitleDesktop>Listings</NavTitleDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('listings')}
          active={activeTab === 'listings'}
        >
          <FaCar /> My Listings
        </NavItemDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('saved')}
          active={activeTab === 'saved'}
        >
          <FaHeart /> Saved Items
        </NavItemDesktop>
      </NavSectionDesktop>

      <NavSectionDesktop>
        <NavTitleDesktop>Communication</NavTitleDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('messages')}
          active={activeTab === 'messages'}
        >
          <FaEnvelope /> Messages
        </NavItemDesktop>
      </NavSectionDesktop>

      <NavSectionDesktop>
        <NavTitleDesktop>Performance</NavTitleDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('analytics')}
          active={activeTab === 'analytics'}
        >
          <FaChartLine /> Analytics
        </NavItemDesktop>
      </NavSectionDesktop>

      <NavSectionDesktop>
        <NavTitleDesktop>Account</NavTitleDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('security')}
          active={activeTab === 'security'}
        >
          <FaShieldAlt /> Security
        </NavItemDesktop>
        <NavItemDesktop
          onClick={() => setActiveTab('preferences')}
          active={activeTab === 'preferences'}
        >
          <FaCog /> Preferences
        </NavItemDesktop>
      </NavSectionDesktop>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'profile':
        return <ProfileSettings />;
      case 'listings':
        return <MyListings />;
      case 'saved':
        return <SavedItems />;
      case 'messages':
        return <MessagesPage />;
      case 'analytics':
        return <Analytics />;
      case 'security':
        return <SecuritySettings />;
      case 'preferences':
        return <Preferences />;
      default:
        return <DashboardOverview />;
    }
  };

  const getPageTitle = (tab: Tab): string => {
    switch (tab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'profile':
        return 'Profile Settings';
      case 'listings':
        return 'My Listings';
      case 'saved':
        return 'Saved Items';
      case 'messages':
        return 'Messages';
      case 'analytics':
        return 'Analytics';
      case 'security':
        return 'Security Settings';
      case 'preferences':
        return 'Preferences';
      default:
        return 'Dashboard';
    }
  };

  return (
    <DashboardLayout>
      <Container>
        <DesktopSidebar>
          {renderDesktopNavItems()}
        </DesktopSidebar>

        <div style={{ flex: 1 }}>
          <DashboardHeader>
            <BackButton
              onClick={handleBackClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaArrowLeft /> Back to Home
            </BackButton>
            <PageTitle>{getPageTitle(activeTab)}</PageTitle>
          </DashboardHeader>

          <Content>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </Content>
        </div>

        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMobileNav}
              />
              <MobileSidebar
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
              >
                {renderDesktopNavItems()}
              </MobileSidebar>
            </>
          )}
        </AnimatePresence>

        <MobileNavToggle
          onClick={toggleMobileNav}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMobileNavOpen ? <FaTimes /> : <FaBars />}
        </MobileNavToggle>
      </Container>
    </DashboardLayout>
  );
};

export default DashboardPage;
