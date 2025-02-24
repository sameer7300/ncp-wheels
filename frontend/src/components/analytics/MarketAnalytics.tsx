import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaSearch, FaDollarSign, FaCarSide, FaMapMarkerAlt, FaChartBar, FaSpinner } from 'react-icons/fa';

const Container = styled.div`
  padding: 24px;
  display: grid;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text};
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MetricTitle = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textLight};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: white;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const ChartControls = styled.div`
  display: flex;
  gap: 12px;
`;

const ChartControl = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.backgroundHover};
  }
`;

const PlaceholderText = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textLight};
  padding: 48px 0;
`;

interface TrendingModel {
  model: string;
  searches: number;
  avgPrice: number;
  priceChange: number;
}

export const MarketAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const trendingModels: TrendingModel[] = [
    {
      model: 'Tesla Model 3',
      searches: 15234,
      avgPrice: 45000,
      priceChange: 2.5
    },
    {
      model: 'Toyota Camry',
      searches: 12456,
      avgPrice: 32000,
      priceChange: -1.2
    },
    {
      model: 'Honda CR-V',
      searches: 11789,
      avgPrice: 35000,
      priceChange: 1.8
    },
    {
      model: 'Ford F-150',
      searches: 10234,
      avgPrice: 48000,
      priceChange: 3.2
    }
  ];

  return (
    <Container>
      <FilterBar>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </Select>

        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All Regions</option>
          <option value="north">North</option>
          <option value="south">South</option>
          <option value="east">East</option>
          <option value="west">West</option>
        </Select>

        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="luxury">Luxury</option>
        </Select>
      </FilterBar>

      <Grid>
        <MetricCard>
          <MetricTitle>
            <FaSearch /> Total Searches
          </MetricTitle>
          <MetricValue>124,567</MetricValue>
          <MetricChange positive>
            <FaChartLine /> +12.5%
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricTitle>
            <FaDollarSign /> Average Price
          </MetricTitle>
          <MetricValue>$35,890</MetricValue>
          <MetricChange positive>
            <FaChartLine /> +3.2%
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricTitle>
            <FaCarSide /> Active Listings
          </MetricTitle>
          <MetricValue>8,234</MetricValue>
          <MetricChange>
            <FaChartLine /> -2.1%
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricTitle>
            <FaMapMarkerAlt /> Top Region
          </MetricTitle>
          <MetricValue>West</MetricValue>
          <MetricChange positive>
            <FaChartLine /> +5.8%
          </MetricChange>
        </MetricCard>
      </Grid>

      <Card>
        <ChartHeader>
          <ChartTitle>
            <FaChartLine /> Price Trends
          </ChartTitle>
          <ChartControls>
            <ChartControl active>All</ChartControl>
            <ChartControl>Sedans</ChartControl>
            <ChartControl>SUVs</ChartControl>
          </ChartControls>
        </ChartHeader>
        {loading ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <ChartContainer>
            Price trend chart will be implemented with a charting library
          </ChartContainer>
        )}
      </Card>

      <Card>
        <ChartHeader>
          <ChartTitle>
            <FaChartBar /> Popular Models
          </ChartTitle>
          <ChartControls>
            <ChartControl active>30 Days</ChartControl>
            <ChartControl>90 Days</ChartControl>
          </ChartControls>
        </ChartHeader>
        {loading ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Model</Th>
                <Th>Searches</Th>
                <Th>Avg. Price</Th>
                <Th>Price Change</Th>
              </tr>
            </thead>
            <tbody>
              {trendingModels.map((model, index) => (
                <tr key={index}>
                  <Td>{model.model}</Td>
                  <Td>{model.searches.toLocaleString()}</Td>
                  <Td>${model.avgPrice.toLocaleString()}</Td>
                  <Td>
                    <MetricChange positive={model.priceChange > 0}>
                      <FaChartLine />
                      {model.priceChange > 0 ? '+' : ''}{model.priceChange}%
                    </MetricChange>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
};
