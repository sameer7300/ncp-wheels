import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { Header } from './components/layout/header';
import { Footer } from './components/footer/Footer';
import Home from './pages/home/Home';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { ProfilePage } from './pages/profile/Profile';
import { ListingsPage } from './pages/listings/ListingsPage';
import { CreateListingPage } from './pages/listings/CreateListingPage';
import { ListingDetailPage } from './pages/listings/ListingDetailPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import styled from 'styled-components';
import { NotificationProvider } from './contexts/NotificationContext';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PaymentPage } from './pages/payments/PaymentPage';
import { PaymentStatusPage } from './pages/payments/PaymentStatusPage';
import { ChatProvider } from './contexts/ChatContext';
import { ChatRoom } from './pages/chat/ChatRoom';
import { About } from './pages/about/About';
import ComingSoonPage from './pages/rental/ComingSoon';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient()

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.backgroundDark};
  color: ${props => props.theme.colors.textLight};
`

const MainContent = styled.main`
  flex: 1;
  margin-top: 64px; // Height of the header
  padding-bottom: 2rem;
`

const AppRoutes = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <AppContainer>
      {!isDashboard && <Header />}
      <MainContent style={{ marginTop: isDashboard ? 0 : '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/listings" element={<ListingsPage />} />
          <Route
            path="/listings/create"
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route
            path="/listings/:listingId/feature"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:listingId/feature/status"
            element={
              <ProtectedRoute>
                <PaymentStatusPage />
              </ProtectedRoute>
            }
          />
          <Route path="/payment-status/:listingId" element={<PaymentStatusPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/rental" element={<ComingSoonPage />} />
          <Route
            path="/chat/:listingId"
            element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainContent>
      {!isDashboard && <Footer />}
      <Toaster position="top-right" />
    </AppContainer>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            },
          }}
        />
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <Router>
                <AppRoutes />
              </Router>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
