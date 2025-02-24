import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaCrown, FaCalendarAlt, FaEnvelope, FaUser } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { useLocation } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const GlowingBackground = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
`;

const FloatingCar = styled(motion.div)`
  position: absolute;
  color: rgba(59, 130, 246, 0.2);
  font-size: ${props => props.size || '40px'};
  z-index: 1;
`;

const ContentWrapper = styled(motion.div)`
  text-align: center;
  z-index: 2;
  max-width: 800px;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled(motion.h2)`
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 48px;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  svg {
    font-size: 32px;
    color: #3b82f6;
    margin-bottom: 16px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  color: white;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
`;

const LoadingDots = styled(motion.div)`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
`;

const Dot = styled(motion.div)`
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
`;

const NotifyButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 15, 15, 0.95);
  padding: 32px;
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  z-index: 1000;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 92%;
    padding: 24px;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
`;

const ModalDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.5;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3b82f6;
    font-size: 16px;
    opacity: 0.8;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 768px) {
    padding: 10px 14px 10px 36px;
    font-size: 0.9rem;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    padding: 11px;
    font-size: 0.95rem;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ComingSoon: React.FC = () => {
  const [dotCount, setDotCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const location = useLocation();
  const service = location.pathname === '/rental' ? 'rental' : 'parts';

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await notificationService.subscribeToService({
        ...formData,
        service
      });
      setIsModalOpen(false);
      toast.success('Thank you for subscribing! We will notify you when the service is available.');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <FaCar />,
      title: "Premium Fleet",
      description: "Access to a curated collection of luxury and performance vehicles"
    },
    {
      icon: <FaCrown />,
      title: "VIP Experience",
      description: "Personalized service with dedicated concierge support"
    },
    {
      icon: <FaCalendarAlt />,
      title: "Flexible Rentals",
      description: "Daily, weekly, and monthly rental options to suit your needs"
    },
    {
      icon: <TbSteeringWheel />,
      title: "Full Insurance",
      description: "Comprehensive coverage for peace of mind during your rental"
    }
  ];

  const floatingCars = Array(6).fill(null).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40 + 'px',
    duration: 15 + Math.random() * 10
  }));

  return (
    <PageContainer>
      <GlowingBackground
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {floatingCars.map((car, index) => (
        <FloatingCar
          key={index}
          size={car.size}
          initial={{ x: `${car.x}%`, y: `${car.y}%` }}
          animate={{
            y: [`${car.y}%`, `${car.y + 10}%`, `${car.y}%`],
            rotate: [0, 360]
          }}
          transition={{
            duration: car.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <FaCar />
        </FloatingCar>
      ))}

      <ContentWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Title>Premium Car Rental Service</Title>
        <Subtitle>
          Experience luxury on wheels. Coming soon to elevate your journey
          {Array(dotCount).fill('.').map((dot, i) => (
            <motion.span key={i}>.</motion.span>
          ))}
        </Subtitle>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {feature.icon}
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>

        <NotifyButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
        >
          Notify Me When Available
        </NotifyButton>

        <LoadingDots>
          {[0, 1, 2].map(i => (
            <Dot
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </LoadingDots>
      </ContentWrapper>

      <AnimatePresence>
        {isModalOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Only close if clicking the overlay itself, not its children
              if (e.target === e.currentTarget && !isSubmitting) {
                setIsModalOpen(false);
              }
            }}
          >
            <Modal
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to overlay
            >
              <CloseButton
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </CloseButton>
              <ModalTitle>Get Notified</ModalTitle>
              <ModalDescription>
                Be the first to know when our {service === 'rental' ? 'premium car rental service' : 'auto parts store'} launches. We'll send you a notification right away!
              </ModalDescription>
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <FaUser />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <FaEnvelope />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
                <SubmitButton
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </SubmitButton>
              </Form>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default ComingSoon;
