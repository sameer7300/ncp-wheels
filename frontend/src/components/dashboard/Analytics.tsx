import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEye, FaEnvelope, FaUser, FaChartLine, FaCarSide, FaCalendarAlt, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { MarketAnalytics } from '../analytics/MarketAnalytics';
import { useAnalytics } from '../../services/analyticsService';

const Container = styled.div`
  padding: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
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

const Alert = styled.div`
  background: ${props => props.theme.colors.warning}20;
  color: ${props => props.theme.colors.warning};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
`;

const ChartCard = styled(Card)`
  min-height: 400px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const TrendIndicator = styled.span<{ positive?: boolean }>`
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
`;

const MapContainer = styled.div`
  height: 300px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textLight};
`;

const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 24px;
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

interface PerformanceData {
  id: number;
  title: string;
  views: number;
  inquiries: number;
  trend: number;
}

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'market'>('personal');
  const { analytics, loading, error } = useAnalytics();

  const stats = [
    {
      icon: <FaEye />,
      value: analytics?.totalViews?.toLocaleString() || '0',
      label: 'Total Listing Views',
      loading: loading || (analytics?.isPartialData && analytics.totalViews === null)
    },
    {
      icon: <FaEnvelope />,
      value: analytics?.totalMessages.toLocaleString() || '0',
      label: 'Total Inquiries',
      loading: loading
    },
    {
      icon: <FaCarSide />,
      value: analytics?.activeListings.toString() || '0',
      label: 'Active Listings',
      loading: loading
    },
    {
      icon: <FaUser />,
      value: analytics?.savedCount.toLocaleString() || '0',
      label: 'Saved Items',
      loading: loading
    }
  ];

  return (
    <Container>
      <TabContainer>
        <Tab
          active={activeTab === 'personal'}
          onClick={() => setActiveTab('personal')}
        >
          Personal Analytics
        </Tab>
        <Tab
          active={activeTab === 'market'}
          onClick={() => setActiveTab('market')}
        >
          Market Insights
        </Tab>
      </TabContainer>

      {error && (
        <Alert>
          <FaChartLine />
          {error}
        </Alert>
      )}

      {activeTab === 'personal' ? (
        <>
          <Grid>
            {stats.map((stat, index) => (
              <StatCard key={index}>
                <StatIcon>{stat.icon}</StatIcon>
                <StatContent>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatContent>
                {stat.loading && (
                  <LoadingOverlay>
                    <LoadingSpinner />
                  </LoadingOverlay>
                )}
              </StatCard>
            ))}
          </Grid>

          <Grid>
            <ChartCard>
              <ChartHeader>
                <ChartTitle>Views Over Time</ChartTitle>
                <ChartControls>
                  <ChartControl active>7 Days</ChartControl>
                  <ChartControl>30 Days</ChartControl>
                  <ChartControl>90 Days</ChartControl>
                </ChartControls>
              </ChartHeader>
              {loading || (analytics?.isPartialData && analytics.viewsOverTime.length === 0) ? (
                <LoadingOverlay>
                  <LoadingSpinner />
                </LoadingOverlay>
              ) : (
                // Replace with actual chart component
                <div>Chart goes here</div>
              )}
            </ChartCard>

            <ChartCard>
              <ChartHeader>
                <ChartTitle>Recent Activity</ChartTitle>
              </ChartHeader>
              {loading || (analytics?.isPartialData && analytics.recentActivity.length === 0) ? (
                <LoadingOverlay>
                  <LoadingSpinner />
                </LoadingOverlay>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Listing</Th>
                      <Th>Type</Th>
                      <Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <Td>{activity.listingTitle}</Td>
                        <Td>{activity.type}</Td>
                        <Td>{activity.timestamp.toLocaleDateString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </ChartCard>
          </Grid>
        </>
      ) : (
        <MarketAnalytics />
      )}
    </Container>
  );
};
