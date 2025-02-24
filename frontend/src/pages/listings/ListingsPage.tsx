import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowseListings } from '../../components/listings/BrowseListings';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #2d2d2d);
  padding-top: 80px;
`;

const PageHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 40px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  line-height: 1.6;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-top: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#3b82f6' : 'white'};
  border: 1px solid ${props => props.active ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }

  svg {
    font-size: 18px;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    justify-content: center;
  }
`;

const LocationSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  min-width: 160px;
  cursor: pointer;

  option {
    background: #2d2d2d;
    color: white;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;

  button {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #2563eb;
    }
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

const ClearFilters = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const ListingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Parse URL search params
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const locationFilter = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num}`;
  };

  const getPriceRangeText = (min: string, max: string) => {
    if (!min && !max) return '';
    if (!min) return `Under ${formatPrice(max)}`;
    if (!max) return `Above ${formatPrice(min)}`;
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const removeFilter = (type: string) => {
    searchParams.delete(type);
    if (type === 'minPrice' || type === 'maxPrice') {
      searchParams.delete('minPrice');
      searchParams.delete('maxPrice');
    }
    navigate(`/listings?${searchParams.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/listings');
  };

  const hasActiveFilters = keyword || locationFilter || minPrice || maxPrice;
  const priceRangeText = getPriceRangeText(minPrice, maxPrice);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <div>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Browse Used Cars
            </Title>
            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find your perfect car from our wide selection of verified used vehicles
            </Subtitle>

            {hasActiveFilters && (
              <ActiveFilters>
                {keyword && (
                  <FilterTag>
                    <FiSearch size={14} />
                    {keyword}
                    <button onClick={() => removeFilter('keyword')}>
                      <FiX size={14} />
                    </button>
                  </FilterTag>
                )}
                {locationFilter && (
                  <FilterTag>
                    <FiMapPin size={14} />
                    {locationFilter}
                    <button onClick={() => removeFilter('location')}>
                      <FiX size={14} />
                    </button>
                  </FilterTag>
                )}
                {priceRangeText && (
                  <FilterTag>
                    Price: {priceRangeText}
                    <button onClick={() => removeFilter('minPrice')}>
                      <FiX size={14} />
                    </button>
                  </FilterTag>
                )}
                <ClearFilters onClick={clearAllFilters}>
                  <FiX /> Clear All Filters
                </ClearFilters>
              </ActiveFilters>
            )}
          </div>

          <FilterBar>
            <FilterGroup>
              <FilterButton 
                active={activeFilter === 'all'} 
                onClick={() => setActiveFilter('all')}
              >
                <FiFilter /> All Cars
              </FilterButton>
              <FilterButton 
                active={activeFilter === 'featured'} 
                onClick={() => setActiveFilter('featured')}
              >
                Featured
              </FilterButton>
              <FilterButton 
                active={activeFilter === 'new'} 
                onClick={() => setActiveFilter('new')}
              >
                Newly Listed
              </FilterButton>
            </FilterGroup>

            <ViewToggle>
              <FilterButton 
                active={viewMode === 'grid'} 
                onClick={() => setViewMode('grid')}
              >
                <FiGrid /> Grid
              </FilterButton>
              <FilterButton 
                active={viewMode === 'list'} 
                onClick={() => setViewMode('list')}
              >
                <FiList /> List
              </FilterButton>
            </ViewToggle>
          </FilterBar>
        </HeaderContent>
      </PageHeader>

      <BrowseListings 
        viewMode={viewMode}
        filters={{
          keyword,
          location: locationFilter,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        }}
      />
    </PageContainer>
  );
};

export default ListingsPage;
