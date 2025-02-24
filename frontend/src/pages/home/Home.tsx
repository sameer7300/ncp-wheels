import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCrown } from 'react-icons/fa';
import { TbSteeringWheel, TbCarSuv } from 'react-icons/tb';
import { BsSpeedometer2 } from 'react-icons/bs';
import BrowseUsedCars from '../../components/browse/BrowseUsedCars';
import { FiSearch, FiArrowRight, FiCheck } from 'react-icons/fi';
import { ListingSlider } from '../../components/listings/ListingSlider';
import { Link, useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #111111, #1a1a1a);
`;

const HeroSection = styled.section`
  position: relative;
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0) 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const HeroText = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SearchContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  max-width: 800px;
  margin: 0 auto;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

const SearchTitle = styled.h2`
  font-size: 1.8rem;
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SearchForm = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1rem;
    color: #4a5568;
    font-size: 1.25rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const SearchButton = styled(motion.button)`
  grid-column: 1 / -1;
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const AnimatedBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
`;

const FloatingCar = styled(motion.div)`
  position: absolute;
  font-size: 8rem;
  color: rgba(59, 130, 246, 0.1);
  pointer-events: none;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
`;

const FeatureText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const BrowseSection = styled.section`
  padding: 80px 20px;
  background: #111111;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: white;
  text-align: center;
  margin-bottom: 60px;
`;

const ServicesSection = styled.section`
  padding: 100px 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  }
`;

const ServiceTitle = styled(motion.h2)`
  font-size: 2.5rem;
  color: white;
  text-align: center;
  margin-bottom: 60px;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 70%);
    pointer-events: none;
  }
`;

const ServiceIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  
  svg {
    width: 30px;
    height: 30px;
    color: white;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 16px;
    z-index: -1;
    opacity: 0.5;
    filter: blur(8px);
  }
`;

const ServiceName = styled.h3`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ServiceDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ServiceFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ServiceFeature = styled.li`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #3b82f6;
    flex-shrink: 0;
  }
`;

const LearnMoreButton = styled(motion(Link))`
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const FeaturedSection = styled(motion.section)`
  padding: 80px 24px;
  background: linear-gradient(to bottom, #2d2d2d, #1a1a1a);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const FeaturedContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const ComingSoonTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ComingSoonText = styled(motion.p)`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.6;
`;

const CarIconContainer = styled(motion.div)`
  font-size: 4rem;
  color: #3b82f6;
  margin-bottom: 32px;
  display: inline-block;
`;

const LoadingDots = styled(motion.div)`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 24px;
`;

const Dot = styled(motion.div)`
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
`;

const GlowingBackground = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%);
  pointer-events: none;
`;

const SliderSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(to bottom, #2d2d2d, #1a1a1a);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  }
`;

const SliderTitle = styled(motion.h2)`
  font-size: 2.5rem;
  color: white;
  text-align: center;
  margin-bottom: 48px;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SliderContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 20px 0;
`;

const SliderTrack = styled(motion.div)`
  display: flex;
  gap: 24px;
  padding: 0 12px;
`;

const ListingCard = styled(motion.div)`
  flex: 0 0 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ListingImage = styled.div<{ imageUrl: string }>`
  height: 200px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  }
`;

const ListingDetails = styled.div`
  padding: 20px;
`;

const ListingTitle = styled.h3`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ListingPrice = styled.div`
  font-size: 1.4rem;
  color: #3b82f6;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ListingInfo = styled.div`
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const sampleListings = [
  {
    id: 1,
    title: "2023 BMW M4 Competition",
    price: "₹85,00,000",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068",
    year: "2023",
    mileage: "1,500 km"
  },
  {
    id: 2,
    title: "2022 Mercedes-Benz S-Class",
    price: "₹1,25,00,000",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8",
    year: "2022",
    mileage: "5,000 km"
  },
  {
    id: 3,
    title: "2023 Audi RS e-tron GT",
    price: "₹1,75,00,000",
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16",
    year: "2023",
    mileage: "500 km"
  },
  {
    id: 4,
    title: "2022 Porsche 911 GT3",
    price: "₹2,15,00,000",
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16",
    year: "2022",
    mileage: "2,000 km"
  },
  {
    id: 5,
    title: "2023 Lamborghini Huracán",
    price: "₹3,50,00,000",
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16",
    year: "2023",
    mileage: "100 km"
  }
];

const pakistanCities = [
  'Select City',
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad'
];

const priceRanges = [
  'Select Price Range',
  'Under PKR 10 Lakh',
  'PKR 10-20 Lakh',
  'PKR 20-30 Lakh',
  'PKR 30-50 Lakh',
  'PKR 50 Lakh-1 Crore',
  'Above PKR 1 Crore'
];

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const getPriceRange = (range: string): { min: string; max: string } => {
    switch (range) {
      case 'Under PKR 10 Lakh':
        return { min: '', max: '1000000' };
      case 'PKR 10-20 Lakh':
        return { min: '1000000', max: '2000000' };
      case 'PKR 20-30 Lakh':
        return { min: '2000000', max: '3000000' };
      case 'PKR 30-50 Lakh':
        return { min: '3000000', max: '5000000' };
      case 'PKR 50 Lakh-1 Crore':
        return { min: '5000000', max: '10000000' };
      case 'Above PKR 1 Crore':
        return { min: '10000000', max: '' };
      default:
        return { min: '', max: '' };
    }
  };

  const handleSearch = () => {
    const priceRange = getPriceRange(searchParams.maxPrice);
    const queryParams = new URLSearchParams();
    
    if (searchParams.keyword) queryParams.set('keyword', searchParams.keyword);
    if (searchParams.location && searchParams.location !== 'Select City') {
      queryParams.set('location', searchParams.location);
    }
    if (priceRange.min) queryParams.set('minPrice', priceRange.min);
    if (priceRange.max) queryParams.set('maxPrice', priceRange.max);

    navigate(`/listings?${queryParams.toString()}`);
  };

  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageContainer>
      <HeroSection>
        <AnimatedBackground
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
        
        {[...Array(3)].map((_, i) => (
          <FloatingCar
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            <TbCarSuv />
          </FloatingCar>
        ))}

        <ContentWrapper>
          <HeroText>
            <HeroTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Find Your Perfect Car
            </HeroTitle>
            <HeroSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Discover the best deals on quality used cars across Pakistan
            </HeroSubtitle>

            <SearchContainer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <SearchTitle>Search Your Dream Car</SearchTitle>
              <SearchForm>
                <InputGroup>
                  <FiSearch />
                  <SearchInput
                    type="text"
                    placeholder="Search by make, model, or keyword"
                    value={searchParams.keyword}
                    onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                  />
                </InputGroup>
                <InputGroup>
                  <FaMapMarkerAlt />
                  <SearchSelect
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  >
                    {pakistanCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </SearchSelect>
                </InputGroup>
                <InputGroup>
                  <FaCrown />
                  <SearchSelect
                    value={searchParams.maxPrice}
                    onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                  >
                    {priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </SearchSelect>
                </InputGroup>
                <SearchButton
                  onClick={handleSearch}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSearch /> Search Cars
                </SearchButton>
              </SearchForm>
            </SearchContainer>

            <Features>
              {[
                { icon: <FiCheck />, text: 'Verified Sellers' },
                { icon: <TbSteeringWheel />, text: 'Quality Assured' },
                { icon: <BsSpeedometer2 />, text: 'Easy Process' }
              ].map((feature, index) => (
                <FeatureItem
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <FeatureText>{feature.text}</FeatureText>
                </FeatureItem>
              ))}
            </Features>
          </HeroText>
        </ContentWrapper>
      </HeroSection>

      <ListingSlider />

      <FeaturedSection>
        <GlowingBackground
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <FeaturedContainer>
          <CarIconContainer
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaCrown style={{ marginRight: '10px' }} />
            <TbCarSuv />
          </CarIconContainer>

          <ComingSoonTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              textShadow: [
                "0 0 20px rgba(59, 130, 246, 0.2)",
                "0 0 30px rgba(59, 130, 246, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.2)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Premium Featured Listings Coming Soon
          </ComingSoonTitle>

          <ComingSoonText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            We're curating an exclusive collection of premium vehicles for our featured listings.
            Stay tuned for a handpicked selection of exceptional cars that meet our highest standards.
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
        </FeaturedContainer>
      </FeaturedSection>

      <BrowseSection>
        <ContentWrapper>
          <SectionTitle>Browse Our Collection</SectionTitle>
          <BrowseUsedCars />
        </ContentWrapper>
      </BrowseSection>

      <ServicesSection>
        <ContentWrapper>
          <ServiceTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Our Premium Services
          </ServiceTitle>
          <ServicesGrid>
            <ServiceCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <ServiceIcon>
                <TbCarSuv />
              </ServiceIcon>
              <ServiceName>Premium Car Rental</ServiceName>
              <ServiceDescription>
                Experience luxury and comfort with our premium car rental service. Choose from a wide range of high-end vehicles for any occasion.
              </ServiceDescription>
              <ServiceFeatures>
                <ServiceFeature>
                  <FiCheck /> 24/7 Customer Support
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Flexible Rental Periods
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Full Insurance Coverage
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Door-to-Door Delivery
                </ServiceFeature>
              </ServiceFeatures>
              <LearnMoreButton
                to="/rental"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Coming Soon
              </LearnMoreButton>
            </ServiceCard>

            <ServiceCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <ServiceIcon>
                <TbSteeringWheel />
              </ServiceIcon>
              <ServiceName>Auto Parts Store</ServiceName>
              <ServiceDescription>
                Find genuine auto parts and accessories for your vehicle. We stock a comprehensive range of high-quality components.
              </ServiceDescription>
              <ServiceFeatures>
                <ServiceFeature>
                  <FiCheck /> Genuine OEM Parts
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Expert Technical Support
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Nationwide Shipping
                </ServiceFeature>
                <ServiceFeature>
                  <FiCheck /> Warranty on All Parts
                </ServiceFeature>
              </ServiceFeatures>
              <LearnMoreButton
                to="/parts"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Coming Soon
              </LearnMoreButton>
            </ServiceCard>
          </ServicesGrid>
        </ContentWrapper>
      </ServicesSection>
    </PageContainer>
  );
};

export default Home;
