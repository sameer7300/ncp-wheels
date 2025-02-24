import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCar } from 'react-icons/fa';
import { BsSpeedometer2 } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import listingsService, { Listing } from '../../services/listingsService';

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

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
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

const ListingCard = styled(motion(Link))`
  flex: 0 0 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ListingImage = styled.div<{ imageUrl: string }>`
  height: 200px;
  background-image: url(${props => props.imageUrl || 'https://via.placeholder.com/300x200'});
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
`;

export const ListingSlider: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderKey, setSliderKey] = useState(0);

  const formatListingPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const fetchedListings = await listingsService.fetchAllListings({
          sortBy: 'createdAt',
          sortDirection: 'desc',
          limit: 10
        });
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSliderKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <SliderSection>
        <ContentWrapper>
          <LoadingContainer>Loading listings...</LoadingContainer>
        </ContentWrapper>
      </SliderSection>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <SliderSection>
      <ContentWrapper>
        <SliderTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Latest Listings
        </SliderTitle>

        <SliderContainer>
          <SliderTrack
            key={sliderKey}
            initial={{ x: 0 }}
            animate={{ x: [0, -1500] }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity
            }}
          >
            {[...listings, ...listings].map((listing, index) => (
              <ListingCard
                key={`${listing.id}-${index}`}
                to={`/listings/${listing.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListingImage imageUrl={listing.images[0]} />
                <ListingDetails>
                  <ListingTitle>{listing.title}</ListingTitle>
                  <ListingPrice>{formatListingPrice(listing.price)}</ListingPrice>
                  <ListingInfo>
                    <span>
                      <BsSpeedometer2 />
                      {listing.mileage} km
                    </span>
                    <span>
                      <FaCar />
                      {listing.year}
                    </span>
                  </ListingInfo>
                </ListingDetails>
              </ListingCard>
            ))}
          </SliderTrack>
        </SliderContainer>
      </ContentWrapper>
    </SliderSection>
  );
};
