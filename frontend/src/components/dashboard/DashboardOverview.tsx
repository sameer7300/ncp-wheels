import React from 'react';
import styled from 'styled-components';
import { FaCar, FaEye, FaEnvelope, FaHeart, FaChartLine, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../../services/analyticsService';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Container = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const StatIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.2s ease-in-out;

  ${StatCard}:hover & {
    transform: scale(1.1);
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ChartSection = styled(motion.section)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChartContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary}20;
`;

const MetricsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricsSection = styled(motion.section)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MetricItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const MetricTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivitySection = styled(motion.section)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ type }) => {
    switch (type) {
      case 'view':
        return '#2196F3';
      case 'message':
        return '#9C27B0';
      case 'save':
        return '#E91E63';
      case 'status_change':
        return '#FF9800';
      default:
        return '#FF9800';
    }
  }}15;
  color: ${({ type }) => {
    switch (type) {
      case 'view':
        return '#2196F3';
      case 'message':
        return '#9C27B0';
      case 'save':
        return '#E91E63';
      case 'status_change':
        return '#FF9800';
      default:
        return '#FF9800';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.light};
  border: none;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
`;

export const DashboardOverview: React.FC = () => {
  const { analytics, loading, error, refreshAnalytics } = useAnalytics();

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <FaSpinner className="spin" size={48} />
          <p>Loading analytics data...</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <Button onClick={refreshAnalytics}>Try Again</Button>
        </ErrorState>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <EmptyState>
          <h3>No Analytics Data</h3>
          <p>Start listing cars to see your analytics!</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <StatsGrid>
        <StatCard>
          <StatIcon color="#4CAF50">
            <FaCar />
          </StatIcon>
          <StatInfo>
            <StatValue>{analytics.activeListings}</StatValue>
            <StatLabel>Active Listings</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#2196F3">
            <FaEye />
          </StatIcon>
          <StatInfo>
            <StatValue>{analytics.totalViews}</StatValue>
            <StatLabel>Total Views</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#9C27B0">
            <FaEnvelope />
          </StatIcon>
          <StatInfo>
            <StatValue>{analytics.totalMessages}</StatValue>
            <StatLabel>Messages</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#E91E63">
            <FaHeart />
          </StatIcon>
          <StatInfo>
            <StatValue>{analytics.savedCount}</StatValue>
            <StatLabel>Saved</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <SectionTitle>Views Over Time</SectionTitle>
        <ChartContainer>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.viewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2196F3" 
                strokeWidth={2}
                dot={{ fill: '#2196F3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartSection>

      <MetricsGrid>
        <MetricsSection>
          <SectionTitle>Most Viewed Listings</SectionTitle>
          <MetricsList>
            {analytics.viewsByListing
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((listing) => (
                <MetricItem key={listing.listingId}>
                  <MetricTitle>{listing.listingTitle}</MetricTitle>
                  <MetricValue>{listing.value} views</MetricValue>
                </MetricItem>
              ))}
          </MetricsList>
        </MetricsSection>

        <MetricsSection>
          <SectionTitle>Most Messaged Listings</SectionTitle>
          <MetricsList>
            {analytics.messagesByListing
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((listing) => (
                <MetricItem key={listing.listingId}>
                  <MetricTitle>{listing.listingTitle}</MetricTitle>
                  <MetricValue>{listing.value} messages</MetricValue>
                </MetricItem>
              ))}
          </MetricsList>
        </MetricsSection>
      </MetricsGrid>

      <ActivitySection>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {analytics.recentActivity.map((activity) => (
            <ActivityItem key={activity.id}>
              <ActivityIcon type={activity.type} />
              <ActivityContent>
                <ActivityTitle>
                  {activity.type === 'view' && 'New view on'}
                  {activity.type === 'message' && 'New message for'}
                  {activity.type === 'save' && 'Someone saved'}
                  {activity.type === 'status_change' && 'Status changed for'}
                  {' '}
                  <strong>{activity.listingTitle}</strong>
                </ActivityTitle>
                <ActivityTime>
                  {format(activity.timestamp, 'MMM d, h:mm a')}
                </ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivitySection>
    </Container>
  );
};
