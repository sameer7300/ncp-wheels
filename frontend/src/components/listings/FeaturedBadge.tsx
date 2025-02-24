import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

const Badge = styled(motion.div)<{ $tier: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${({ $tier }) => {
    switch ($tier) {
      case 'monthly':
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'biweekly':
        return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
      default:
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
  }};
  padding: 6px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
`;

const BadgeText = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const CrownIcon = styled(FaCrown)`
  color: white;
  font-size: 0.875rem;
`;

const TimeRemaining = styled.div`
  position: absolute;
  top: 52px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  padding: 4px 8px;
  border-radius: 8px;
  color: white;
  font-size: 0.75rem;
  z-index: 10;
`;

interface FeaturedBadgeProps {
  tier: string;
  expiresAt: Date;
}

const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({ tier, expiresAt }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAt.getTime() - now.getTime();
      
      if (difference <= 0) {
        return 'Expired';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h left`;
      }
      return `${hours}h left`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <>
      <Badge
        $tier={tier}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CrownIcon />
        <BadgeText>Featured</BadgeText>
      </Badge>
      <TimeRemaining>{timeLeft}</TimeRemaining>
    </>
  );
};

export default FeaturedBadge;
