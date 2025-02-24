import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCrown, FaCheck } from 'react-icons/fa';
import { FeaturedPaymentModal } from '../payments/FeaturedPaymentModal';

export const FEATURED_TIERS = {
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Feature',
    price: 300,
    duration: 7,
    features: [
      'Top placement for 7 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility'
    ]
  },
  BIWEEKLY: {
    id: 'biweekly',
    name: '14 Days Feature',
    price: 500,
    duration: 14,
    features: [
      'Top placement for 14 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility',
      'Extended reach'
    ]
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Feature',
    price: 1000,
    duration: 30,
    features: [
      'Top placement for 30 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility',
      'Maximum exposure',
      'Best value'
    ]
  }
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 2rem;
  margin-bottom: 16px;
  
  svg {
    color: #3b82f6;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-bottom: 48px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const PackageCard = styled(motion.div)<{ $popular?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;

  ${props => props.$popular && `
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    
    &::before {
      content: 'Most Popular';
      position: absolute;
      top: 12px;
      right: -32px;
      background: #3b82f6;
      padding: 6px 40px;
      transform: rotate(45deg);
      font-size: 0.8rem;
      font-weight: 500;
    }
  `}
`;

const PackageName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const Price = styled.div`
  margin: 24px 0;
  
  .amount {
    font-size: 2.5rem;
    font-weight: 600;
    color: #3b82f6;
  }
  
  .duration {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
  }
`;

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const SelectButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

interface FeaturedPackagesProps {
  listingId: string;
  onFeatureSuccess: () => void;
}

export const FeaturedPackages: React.FC<FeaturedPackagesProps> = ({
  listingId,
  onFeatureSuccess
}) => {
  const [selectedPackage, setSelectedPackage] = useState<null | {
    tier: string;
    price: number;
    duration: number;
  }>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePackageSelect = (tier: keyof typeof FEATURED_TIERS) => {
    const selected = FEATURED_TIERS[tier];
    setSelectedPackage({
      tier: selected.id,
      price: selected.price,
      duration: selected.duration
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    onFeatureSuccess();
    setIsPaymentModalOpen(false);
    setSelectedPackage(null);
  };

  return (
    <Container>
      <Title>
        <FaCrown /> Feature Your Listing
      </Title>
      <Subtitle>
        Boost your listing's visibility and get more potential buyers
      </Subtitle>

      <Grid>
        <PackageCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PackageName>{FEATURED_TIERS.WEEKLY.name}</PackageName>
          <Price>
            <span className="amount">PKR {FEATURED_TIERS.WEEKLY.price}</span>
            <span className="duration"> / week</span>
          </Price>
          <Features>
            {FEATURED_TIERS.WEEKLY.features.map((feature, index) => (
              <Feature key={index}>
                <FaCheck /> {feature}
              </Feature>
            ))}
          </Features>
          <SelectButton
            onClick={() => handlePackageSelect('WEEKLY')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Select Package
          </SelectButton>
        </PackageCard>

        <PackageCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          $popular
        >
          <PackageName>{FEATURED_TIERS.BIWEEKLY.name}</PackageName>
          <Price>
            <span className="amount">PKR {FEATURED_TIERS.BIWEEKLY.price}</span>
            <span className="duration"> / 2 weeks</span>
          </Price>
          <Features>
            {FEATURED_TIERS.BIWEEKLY.features.map((feature, index) => (
              <Feature key={index}>
                <FaCheck /> {feature}
              </Feature>
            ))}
          </Features>
          <SelectButton
            onClick={() => handlePackageSelect('BIWEEKLY')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Select Package
          </SelectButton>
        </PackageCard>

        <PackageCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <PackageName>{FEATURED_TIERS.MONTHLY.name}</PackageName>
          <Price>
            <span className="amount">PKR {FEATURED_TIERS.MONTHLY.price}</span>
            <span className="duration"> / month</span>
          </Price>
          <Features>
            {FEATURED_TIERS.MONTHLY.features.map((feature, index) => (
              <Feature key={index}>
                <FaCheck /> {feature}
              </Feature>
            ))}
          </Features>
          <SelectButton
            onClick={() => handlePackageSelect('MONTHLY')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Select Package
          </SelectButton>
        </PackageCard>
      </Grid>

      {selectedPackage && (
        <FeaturedPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          selectedPackage={selectedPackage}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Container>
  );
};

export default FeaturedPackages;
