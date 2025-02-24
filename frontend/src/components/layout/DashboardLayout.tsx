import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.default};
`;

const Main = styled.main`
  flex: 1;
  position: relative;
  z-index: 1;
`;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Main>{children}</Main>
    </LayoutContainer>
  );
};

export default DashboardLayout;
