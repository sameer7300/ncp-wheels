import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Menu, X, User, LogOut, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authService } from '../../services/auth';
import LogoImage from '../../assets/logo-ncp-wheels/logo.png';
import { FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const HeaderInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover {
      color: #60a5fa;
    }
  }
`;

const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const LogoContainer = styled(motion(Link))`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
`;

const StyledLogo = styled.img`
  height: 40px;
  width: auto;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const BrandTagline = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Nav = styled(motion.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const MenuButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLinks = styled(motion.div)<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: fixed;
    top: 120px;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.95);
    flex-direction: column;
    padding: 2rem;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
  }
`;

const NavLink = styled(motion(Link))`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.5rem;
`;

const UserMenuItem = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
`;

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close menus when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <HeaderContainer>
      <HeaderInner>
        <HeaderTop>
          <PoweredBy>
            Powered by{' '}
            <motion.a
              href="https://gullautos.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Gull Autos
            </motion.a>
          </PoweredBy>
        </HeaderTop>
        
        <HeaderMain>
          <LogoContainer
            to="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <StyledLogo src={LogoImage} alt="NCP Wheels Logo" />
            <LogoText>
              <BrandName>NCP Wheels</BrandName>
              <BrandTagline>Premium Auto Marketplace</BrandTagline>
            </LogoText>
          </LogoContainer>

          <MenuButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </AnimatePresence>
          </MenuButton>

          <NavLinks
            isOpen={isMenuOpen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NavLink
              to="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/listings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              Listings
            </NavLink>
            <NavLink
              to="/about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              as="a"
              href="https://gullautos.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag />
              Store
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/listings/create"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button>
                    <FaPlus /> Create Listing
                  </Button>
                </NavLink>
                <UserMenu>
                  <UserMenuButton
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={20} />
                    {user.email}
                  </UserMenuButton>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <UserMenuDropdown
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <UserMenuItem
                          as={Link}
                          to="/dashboard"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <User size={18} />
                          Dashboard
                        </UserMenuItem>
                        <UserMenuItem
                          as={Link}
                          to="/profile"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <User size={18} />
                          Profile
                        </UserMenuItem>
                        <UserMenuItem
                          onClick={handleLogout}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LogOut size={18} />
                          Logout
                        </UserMenuItem>
                      </UserMenuDropdown>
                    )}
                  </AnimatePresence>
                </UserMenu>
              </>
            ) : (
              <AuthButtons>
                <Button
                  as={Link}
                  to="/login"
                  variant="secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Button>
              </AuthButtons>
            )}
          </NavLinks>
        </HeaderMain>
      </HeaderInner>
    </HeaderContainer>
  );
};

export const HeaderHeight = '120px'; // This will be used for main content padding

export default Header;
