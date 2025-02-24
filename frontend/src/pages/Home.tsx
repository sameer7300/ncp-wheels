import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCar, FaStar, FaSpinner } from 'react-icons/fa'
import { useEffect, useState } from 'react'

const Container = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background.default};
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Logo = styled.h1`
  ${({ theme }) => theme.typography.h1};
  color: ${({ theme }) => theme.colors.primary.main};
`

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.main}10;
  }
`

const Hero = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const HeroTitle = styled.h2`
  ${({ theme }) => theme.typography.h1};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const HeroText = styled.p`
  ${({ theme }) => theme.typography.body1};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CategorySection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const SectionTitle = styled.h3`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const CategoryCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`

const CategoryTitle = styled.h4`
  ${({ theme }) => theme.typography.h3};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: ${({ theme }) => theme.spacing.md};
`

const FeaturedSection = styled(motion.section)`
  margin: 48px 0;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const ComingSoonTitle = styled(motion.h2)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 16px;
  background: linear-gradient(to right, #ff4e50, #f9d423);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ComingSoonText = styled(motion.p)`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 24px;
  max-width: 600px;
  margin: 0 auto 24px;
`;

const GlowingBorder = styled(motion.div)`
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 16px;
  background: linear-gradient(45deg, #ff4e50, #f9d423, #ff4e50) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
`;

const CarIcon = styled(motion.div)`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 24px;
`;

const LoadingDots = styled(motion.div)`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
`;

export function HomePage() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Header>
        <Logo>NCP Wheels</Logo>
        <Nav>
          <NavLink to="/listings">Browse Cars</NavLink>
          <NavLink to="/sell">Sell Your Car</NavLink>
        </Nav>
      </Header>

      <Hero>
        <HeroTitle>Find Your Perfect Car</HeroTitle>
        <HeroText>
          Browse thousands of cars from trusted dealers and private sellers
        </HeroText>
      </Hero>

      <FeaturedSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlowingBorder 
          animate={{ 
            background: [
              "linear-gradient(45deg, #ff4e50, #f9d423, #ff4e50) border-box",
              "linear-gradient(225deg, #ff4e50, #f9d423, #ff4e50) border-box",
              "linear-gradient(45deg, #ff4e50, #f9d423, #ff4e50) border-box"
            ]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
        
        <CarIcon
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaCar />
        </CarIcon>

        <ComingSoonTitle
          animate={{ 
            scale: [1, 1.02, 1],
            textShadow: [
              "0 0 20px rgba(255,78,80,0.2)",
              "0 0 30px rgba(255,78,80,0.4)",
              "0 0 20px rgba(255,78,80,0.2)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Featured Listings Coming Soon
        </ComingSoonTitle>

        <ComingSoonText
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          We're working on bringing you the most exclusive and premium car listings.
          Stay tuned for an enhanced car shopping experience!
        </ComingSoonText>

        <LoadingDots>
          {[...Array(3)].map((_, i) => (
            <Dot
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: i <= dotCount ? 1 : 0.3,
                scale: i <= dotCount ? 1.2 : 1
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </LoadingDots>
      </FeaturedSection>

      <CategorySection>
        <SectionTitle>Browse by Category</SectionTitle>
        <CategoryGrid>
          <CategoryCard to="/listings?category=sedans">
            <CategoryTitle>Sedans</CategoryTitle>
          </CategoryCard>
          <CategoryCard to="/listings?category=suvs">
            <CategoryTitle>SUVs</CategoryTitle>
          </CategoryCard>
          <CategoryCard to="/listings?category=sports">
            <CategoryTitle>Sports Cars</CategoryTitle>
          </CategoryCard>
        </CategoryGrid>
      </CategorySection>
    </Container>
  )
}

const categories = [
  {
    name: 'SUVs',
    slug: 'suvs',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80',
  },
  {
    name: 'Sedans',
    slug: 'sedans',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports Cars',
    slug: 'sports',
    image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&q=80',
  },
]

const features = [
  {
    title: 'Verified Sellers',
    description: 'All our sellers are verified to ensure a safe buying experience',
    icon: '🛡️',
  },
  {
    title: 'Secure Payments',
    description: 'Your transactions are protected with bank-grade security',
    icon: '💳',
  },
  {
    title: '24/7 Support',
    description: 'Our customer support team is always here to help',
    icon: '🎯',
  },
]
