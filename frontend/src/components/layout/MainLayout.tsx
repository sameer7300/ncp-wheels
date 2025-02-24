import React from 'react';
import styled from 'styled-components';
import Header, { HeaderHeight } from './Header';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding-top: calc(${HeaderHeight} + 2rem); /* Increased padding to account for header + top bar + extra space */
  width: 100%;
  max-width: 1400px; /* Match header max-width */
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding-top: calc(${HeaderHeight} + 1rem);
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const MainWrapper = styled.div`
  width: 100%;
  min-height: calc(100vh - ${HeaderHeight});
  background: #111111;
  position: relative;
  z-index: 1;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <MainWrapper>
        <Main>{children}</Main>
      </MainWrapper>
    </LayoutContainer>
  );
};

export default MainLayout;
