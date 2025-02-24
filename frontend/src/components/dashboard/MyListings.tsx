import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCar, FaEdit, FaTrash, FaEye, FaClock, FaChartLine, FaPause, FaPlay, FaPlus } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useListings, Listing } from '../../services/listings';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const Container = styled(motion.div)`
  padding: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    z-index: 0;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    
    &::before {
      height: 150px;
      border-bottom-left-radius: 30px;
      border-bottom-right-radius: 30px;
    }
  }
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  padding-top: 2rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background-color: ${({ active }) => active ? '#007bff' : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ active }) => active ? '#ffffff' : '#333333'};
  cursor: pointer;
  font-weight: ${({ active }) => active ? '600' : '500'};
  font-size: 1rem;
  box-shadow: ${({ active }) => active ? '0 4px 12px rgba(0, 123, 255, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ active }) => active ? '#0056b3' : 'rgba(255, 255, 255, 1)'};
    transform: translateY(-2px);
    box-shadow: ${({ active }) => active ? '0 6px 16px rgba(0, 123, 255, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)'};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const ListingGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 1rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
`;

const ListingCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #007bff, #00ff88);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const ListingImage = styled.div<{ imageUrl: string }>`
  height: 220px;
  background-image: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0) 0%, 
    rgba(0, 0, 0, 0.4) 100%
  ), url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.3s ease;
  
  ${ListingCard}:hover & {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const ListingContent = styled.div`
  padding: 1.5rem;
  position: relative;
`;

const ListingTitle = styled.h3`
  margin: 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ListingPrice = styled(motion.div)`
  color: #007bff;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.75rem 0;
  display: inline-block;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ListingDescription = styled.p`
  color: #4a4a4a;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ListingMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666666;
  font-size: 0.875rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  
  svg {
    color: #007bff;
  }
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    font-size: 0.75rem;
  }
`;

const ListingActions = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
`;

const ActionButton = styled(motion.button)<{ variant: 'primary' | 'danger' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: ${({ variant }) => 
    variant === 'primary' ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' :
    variant === 'danger' ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
    'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)'
  };
  color: ${({ variant }) => 
    variant === 'warning' ? '#000000' : '#ffffff'
  };
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.1em;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #007bff;
  
  svg {
    font-size: 2.5rem;
  }
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 300px;
  text-align: center;
  color: #666666;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  svg {
    font-size: 3rem;
    color: #007bff;
  }
  
  p {
    font-size: 1.25rem;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    
    svg {
      font-size: 2.5rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const ListingStatus = styled(motion.div)<{ status: Listing['status'] }>`
  color: ${({ status }) => 
    status === 'active' ? '#28a745' :
    status === 'draft' ? '#ffc107' :
    status === 'expired' ? '#dc3545' :
    '#666666'
  };
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${({ status }) => 
    status === 'active' ? 'rgba(40, 167, 69, 0.1)' :
    status === 'draft' ? 'rgba(255, 193, 7, 0.1)' :
    status === 'expired' ? 'rgba(220, 53, 69, 0.1)' :
    'rgba(102, 102, 102, 0.1)'
  };
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
`;

const FeaturedBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #ffd700, #ffa500);
  color: #000;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  position: absolute;
  top: 1rem;
  right: 1rem;
  backdrop-filter: blur(4px);
  
  svg {
    color: #000;
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
`;

export const MyListings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'expired'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth();
  const listingsService = useListings();

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await listingsService.fetchUserListings();
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
      showNotification('error', 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: Listing['status']) => {
    try {
      await listingsService.updateListingStatus(listingId, newStatus);
      showNotification('success', `Listing ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      await loadListings(); // Reload listings to reflect changes
    } catch (error) {
      console.error('Error updating listing status:', error);
      showNotification('error', 'Failed to update listing status');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await listingsService.deleteListing(listingId);
        showNotification('success', 'Listing deleted successfully');
        await loadListings(); // Reload listings to reflect changes
      } catch (error) {
        console.error('Error deleting listing:', error);
        showNotification('error', 'Failed to delete listing');
      }
    }
  };

  const handleEdit = (listingId: string) => {
    navigate(`/listings/edit/${listingId}`);
  };

  const handleFeatureListing = (listingId: string) => {
    navigate(`/listings/${listingId}/feature`);
  };

  const handleUpgradeToFeatured = (listingId: string) => {
    navigate(`/payments?listingId=${listingId}&action=upgrade`);
  };

  const filteredListings = listings.filter(listing => {
    switch (activeTab) {
      case 'active':
        return listing.status === 'active';
      case 'draft':
        return listing.status === 'draft';
      case 'expired':
        return listing.status === 'expired';
      default:
        return true;
    }
  });

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader>
        <HeaderTitle>My Listings</HeaderTitle>
      </DashboardHeader>
      
      <TabBar>
        <Tab
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('all')}
          active={activeTab === 'all'}
        >
          All Listings ({listings.length})
        </Tab>
        <Tab
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('active')}
          active={activeTab === 'active'}
        >
          Active ({listings.filter(l => l.status === 'active').length})
        </Tab>
        <Tab
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('draft')}
          active={activeTab === 'draft'}
        >
          Draft ({listings.filter(l => l.status === 'draft').length})
        </Tab>
        <Tab
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('expired')}
          active={activeTab === 'expired'}
        >
          Expired ({listings.filter(l => l.status === 'expired').length})
        </Tab>
      </TabBar>

      {loading ? (
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaClock />
        </LoadingSpinner>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaCar />
          <p>No listings found in this category</p>
          <ActionButton
            variant="primary"
            onClick={() => navigate('/listings/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Create New Listing
          </ActionButton>
        </EmptyState>
      ) : (
        <ListingGrid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                variants={cardVariants}
                whileHover="hover"
                layout
              >
                <ListingImage imageUrl={listing.images?.[0] || '/placeholder-car.jpg'} />
                <ListingContent>
                  <ListingTitle>{listing.title}</ListingTitle>
                  <ListingPrice
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    PKR {listing.price.toLocaleString()}
                  </ListingPrice>
                  <ListingMeta>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FaClock />
                      {listing.createdAt && formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                    </motion.span>
                    {listing.featured && listing.featuredUntil && (
                      <FeaturedBadge
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <FaChartLine />
                        Featured until {formatDistanceToNow(listing.featuredUntil, { addSuffix: true })}
                      </FeaturedBadge>
                    )}
                  </ListingMeta>
                  <ListingDescription>{listing.description}</ListingDescription>
                  <ListingStatus
                    status={listing.status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </ListingStatus>
                </ListingContent>
                <ListingActions
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ActionButton
                    variant="primary"
                    onClick={() => handleEdit(listing.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                  
                  {listing.status === 'active' ? (
                    <ActionButton
                      variant="warning"
                      onClick={() => handleStatusChange(listing.id, 'draft')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPause /> Deactivate
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="primary"
                      onClick={() => handleStatusChange(listing.id, 'active')}
                      disabled={listing.status === 'expired'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlay /> Activate
                    </ActionButton>
                  )}

                  {!listing.featured && listing.status === 'active' && (
                    <ActionButton
                      variant="primary"
                      onClick={() => handleUpgradeToFeatured(listing.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaChartLine /> Upgrade to Featured
                    </ActionButton>
                  )}

                  <ActionButton
                    variant="danger"
                    onClick={() => handleDelete(listing.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash /> Delete
                  </ActionButton>
                </ListingActions>
              </ListingCard>
            ))}
          </AnimatePresence>
        </ListingGrid>
      )}
    </Container>
  );
};
