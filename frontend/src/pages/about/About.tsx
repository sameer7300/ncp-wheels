import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCar, FaHandshake, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { MainLayout } from '../../components/layout/MainLayout';

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  background: #121212;
  color: white;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 80px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 60px 20px;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
  
  span {
    color: #3b82f6;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin: 60px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    border-color: #3b82f6;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 2.5rem;
    color: #3b82f6;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }
`;

const AboutSection = styled.div`
  margin: 80px 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;

  @media (max-width: 768px) {
    padding: 32px;
  }
`;

const AboutContent = styled.div`
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
    margin-bottom: 24px;
    font-size: 1.1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin: 80px 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 32px;
  }
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-4px);
  }

  h4 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 12px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export const About: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer>
        <Container>
          <Hero>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to <span>NCP Wheels</span>
            </Title>
            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Pakistan's Premier Non-Custom Paid Vehicle Marketplace
            </Subtitle>
          </Hero>

          <FeaturesGrid>
            <FeatureCard
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FaCar />
              <h3>Extensive Selection</h3>
              <p>Browse through our vast collection of non-custom paid vehicles from trusted sellers across Pakistan.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FaHandshake />
              <h3>Trusted Platform</h3>
              <p>Powered by Gull Autos, we ensure secure and reliable transactions for all our users.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <FaShieldAlt />
              <h3>Verified Listings</h3>
              <p>Every vehicle listing undergoes thorough verification to ensure authenticity and quality.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <FaUsers />
              <h3>Expert Support</h3>
              <p>Our dedicated team provides expert guidance throughout your buying or selling journey.</p>
            </FeatureCard>
          </FeaturesGrid>

          <AboutSection>
            <AboutContent>
              <h2>About NCP Wheels</h2>
              <p>
                NCP Wheels is Pakistan's leading online marketplace dedicated to non-custom paid vehicles. 
                We bring years of expertise in the automotive industry to provide a seamless platform for 
                buyers and sellers.
              </p>
              <p>
                Our mission is to revolutionize the non-custom paid vehicle market by providing a 
                transparent, secure, and efficient platform. We understand the unique challenges of 
                this market and have built our platform to address these specific needs.
              </p>
              <p>
                With our extensive network of trusted sellers and comprehensive verification process, 
                we ensure that every vehicle listed on our platform meets the highest standards of 
                quality and authenticity.
              </p>
            </AboutContent>
          </AboutSection>

          <StatsSection>
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h4>5000+</h4>
              <p>Listed Vehicles</p>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4>10K+</h4>
              <p>Happy Customers</p>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4>15+</h4>
              <p>Years Experience</p>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h4>24/7</h4>
              <p>Customer Support</p>
            </StatCard>
          </StatsSection>
        </Container>
      </PageContainer>
    </MainLayout>
  );
};
