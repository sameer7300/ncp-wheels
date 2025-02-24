import React, { useState } from 'react';
import styled from 'styled-components';
import { AdvancedSearch } from '../../components/search/AdvancedSearch';
import { FaList, FaThLarge } from 'react-icons/fa';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  padding: 8px;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.backgroundHover};
  }
`;

const ResultsContainer = styled.div`
  margin-top: 24px;
`;

const Grid = styled.div<{ view: 'grid' | 'list' }>`
  display: grid;
  gap: 24px;
  grid-template-columns: ${props => props.view === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr'};
`;

const ListingCard = styled.div<{ view: 'grid' | 'list' }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
  display: ${props => props.view === 'list' ? 'flex' : 'block'};
  gap: ${props => props.view === 'list' ? '24px' : '0'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ListingImage = styled.img<{ view: 'grid' | 'list' }>`
  width: ${props => props.view === 'list' ? '300px' : '100%'};
  height: ${props => props.view === 'list' ? '200px' : '200px'};
  object-fit: cover;
`;

const ListingContent = styled.div`
  padding: 16px;
  flex: 1;
`;

const ListingTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  color: ${props => props.theme.colors.text};
`;

const ListingPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const ListingDetails = styled.div`
  display: flex;
  gap: 16px;
  color: ${props => props.theme.colors.textLight};
  font-size: 0.875rem;
  margin-bottom: 16px;
`;

const ListingDescription = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.5;
`;

interface Listing {
  id: number;
  title: string;
  price: number;
  image: string;
  year: number;
  mileage: string;
  location: string;
  description: string;
}

export const SearchPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Mock data - replace with API call
  const listings: Listing[] = [
    {
      id: 1,
      title: '2020 BMW X5 xDrive40i',
      price: 65000,
      image: 'https://example.com/bmw.jpg',
      year: 2020,
      mileage: '25,000 km',
      location: 'New York, NY',
      description: 'Excellent condition, one owner, full service history. Premium package, panoramic roof, and more.'
    },
    {
      id: 2,
      title: '2019 Mercedes-Benz C300',
      price: 45000,
      image: 'https://example.com/mercedes.jpg',
      year: 2019,
      mileage: '35,000 km',
      location: 'Los Angeles, CA',
      description: 'AMG Sport Package, Premium Sound System, Navigation, Leather Interior.'
    },
    {
      id: 3,
      title: '2021 Tesla Model 3',
      price: 52000,
      image: 'https://example.com/tesla.jpg',
      year: 2021,
      mileage: '15,000 km',
      location: 'Miami, FL',
      description: 'Long Range, Full Self-Driving Capability, Premium Interior, Glass Roof.'
    }
  ];

  return (
    <Container>
      <Header>
        <Title>Search Vehicles</Title>
        <ViewToggle>
          <ToggleButton
            active={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <FaThLarge />
          </ToggleButton>
          <ToggleButton
            active={view === 'list'}
            onClick={() => setView('list')}
          >
            <FaList />
          </ToggleButton>
        </ViewToggle>
      </Header>

      <AdvancedSearch />

      <ResultsContainer>
        <Grid view={view}>
          {listings.map(listing => (
            <ListingCard key={listing.id} view={view}>
              <ListingImage
                src={listing.image}
                alt={listing.title}
                view={view}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <ListingContent>
                <ListingTitle>{listing.title}</ListingTitle>
                <ListingPrice>${listing.price.toLocaleString()}</ListingPrice>
                <ListingDetails>
                  <span>{listing.year}</span>
                  <span>{listing.mileage}</span>
                  <span>{listing.location}</span>
                </ListingDetails>
                <ListingDescription>{listing.description}</ListingDescription>
              </ListingContent>
            </ListingCard>
          ))}
        </Grid>
      </ResultsContainer>
    </Container>
  );
};
