import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeart, FaEye, FaClock, FaTrash, FaCar } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedItems, SavedItem } from '../../services/saved';
import { formatDistanceToNow } from 'date-fns';

const Container = styled(motion.div)`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.light};
  margin: 0;
`;

const SavedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const SavedCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.darker};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
`;

const CardImage = styled.div`
  position: relative;
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  color: ${props => props.theme.colors.text.light};
  margin: 0 0 8px 0;
  font-size: 1.25rem;
`;

const CardPrice = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.theme.colors.background.dark};
  color: ${props => props.theme.colors.text.light};

  &:hover {
    background: ${props => props.theme.colors.background.darker};
  }

  &.danger {
    background: ${props => props.theme.colors.error};
    color: white;

    &:hover {
      background: ${props => props.theme.colors.accent.red};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
`;

const SavedAt = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SavedItems: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { fetchSavedItems, removeSavedListing } = useSavedItems();

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      const items = await fetchSavedItems();
      setSavedItems(items);
    } catch (error) {
      console.error('Error loading saved items:', error);
      showNotification('Error loading saved items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (listingId: string) => {
    try {
      await removeSavedListing(listingId);
      await loadSavedItems();
      showNotification('Item removed from saved listings', 'success');
    } catch (error) {
      console.error('Error removing saved item:', error);
      showNotification('Error removing item', 'error');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Saved Listings</Title>
        </Header>
        <div>Loading...</div>
      </Container>
    );
  }

  if (savedItems.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Saved Listings</Title>
        </Header>
        <EmptyState>
          <FaHeart size={48} color="#2563EB" />
          <h3>No Saved Listings</h3>
          <p>Items you save will appear here</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Saved Listings ({savedItems.length})</Title>
      </Header>

      <SavedGrid>
        {savedItems.map(item => (
          <SavedCard
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ y: -4 }}
          >
            <CardImage>
              {item.listing?.imageUrl && (
                <img src={item.listing.imageUrl} alt={item.listing.title} />
              )}
            </CardImage>

            <CardContent>
              <CardTitle>{item.listing?.title}</CardTitle>
              <CardPrice>PKR {item.listing?.price.toLocaleString()}</CardPrice>

              <CardMeta>
                <MetaItem>
                  <FaCar />
                  {item.listing?.specifications.make} {item.listing?.specifications.model}
                </MetaItem>
                <MetaItem>
                  <FaClock />
                  {item.listing?.specifications.year}
                </MetaItem>
              </CardMeta>

              <CardActions>
                <ActionButton onClick={() => navigate(`/listings/${item.listingId}`)}>
                  <FaEye /> View Details
                </ActionButton>
                <ActionButton className="danger" onClick={() => handleUnsave(item.listingId)}>
                  <FaTrash /> Remove
                </ActionButton>
              </CardActions>

              <SavedAt>
                <FaClock />
                Saved {formatDistanceToNow(item.savedAt)} ago
              </SavedAt>
            </CardContent>
          </SavedCard>
        ))}
      </SavedGrid>
    </Container>
  );
};
