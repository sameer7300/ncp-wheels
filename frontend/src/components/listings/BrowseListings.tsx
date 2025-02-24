import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShare2, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { TbManualGearbox } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import listingsService, { Listing, ListingFilters } from '../../services/listingsService';

interface BrowseListingsProps {
  viewMode: 'grid' | 'list';
  filters: ListingFilters;
}

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 48px;

  @media (max-width: 768px) {
    padding: 0 16px 32px;
  }
`;

const ListingsGrid = styled.div<{ viewMode: 'grid' | 'list' }>`
  display: grid;
  grid-template-columns: ${props => props.viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr'};
  gap: 24px;
  margin-top: 32px;
`;

const ListingCard = styled(motion.div)<{ viewMode: 'grid' | 'list'; isFeatured?: boolean }>`
  background: ${props => props.isFeatured ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isFeatured ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: ${props => props.viewMode === 'list' ? 'flex' : 'block'};
  gap: ${props => props.viewMode === 'list' ? '24px' : '0'};
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.isFeatured ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)'};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
`;

const ImageContainer = styled.div<{ viewMode: 'grid' | 'list' }>`
  position: relative;
  width: ${props => props.viewMode === 'list' ? '300px' : '100%'};
  aspect-ratio: 16/9;
  overflow: hidden;
`;

const ListingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ListingCard}:hover & {
    transform: scale(1.05);
  }
`;

const ListingContent = styled.div<{ viewMode: 'grid' | 'list' }>`
  padding: 20px;
  flex: 1;
`;

const ListingTitle = styled.h3`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ListingPrice = styled.div`
  font-size: 1.5rem;
  color: #3b82f6;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ListingDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;

  svg {
    color: #3b82f6;
  }
`;

const ListingActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.8);
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 16px;
    color: white;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 24px;
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  margin: 48px auto;
`;

const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `PKR ${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `PKR ${(price / 100000).toFixed(2)} Lakh`;
  } else if (price >= 1000) {
    return `PKR ${(price / 1000).toFixed(0)}k`;
  }
  return `PKR ${price.toLocaleString()}`;
};

export const BrowseListings: React.FC<BrowseListingsProps> = ({ viewMode, filters }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const fetchedListings = await listingsService.fetchAllListings(filters);
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const handleListingClick = (listingId: string) => {
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </Container>
    );
  }

  if (!listings.length) {
    return (
      <Container>
        <NoResults>
          <h3>No Results Found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </NoResults>
      </Container>
    );
  }

  return (
    <Container>
      <ListingsGrid viewMode={viewMode}>
        <AnimatePresence>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              viewMode={viewMode}
              isFeatured={listing.featured}
              onClick={() => handleListingClick(listing.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {listing.featured && <FeaturedBadge>Featured</FeaturedBadge>}
              <ImageContainer viewMode={viewMode}>
                <ListingImage src={listing.images[0]} alt={listing.title} />
              </ImageContainer>
              <ListingContent viewMode={viewMode}>
                <ListingTitle>{listing.title}</ListingTitle>
                <ListingPrice>{formatPrice(listing.price)}</ListingPrice>
                <ListingDetails>
                  <DetailItem>
                    <FiMapPin />
                    {listing.location}
                  </DetailItem>
                  <DetailItem>
                    <FiCalendar />
                    {listing.year}
                  </DetailItem>
                  <DetailItem>
                    <BsSpeedometer2 />
                    {listing.mileage.toLocaleString()} km
                  </DetailItem>
                  <DetailItem>
                    <TbManualGearbox />
                    {listing.transmission}
                  </DetailItem>
                </ListingDetails>
                <ListingActions>
                  <ActionButton>
                    <FiHeart />
                    Save
                  </ActionButton>
                  <ActionButton>
                    <FiShare2 />
                    Share
                  </ActionButton>
                </ListingActions>
              </ListingContent>
            </ListingCard>
          ))}
        </AnimatePresence>
      </ListingsGrid>
    </Container>
  );
};

export default BrowseListings;
