import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaCar, 
  FaTachometerAlt, 
  FaCogs, 
  FaGasPump, 
  FaMapMarkerAlt, 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCrown,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaCheck,
  FaMoneyBill,
  FaEye,
  FaCog,
  FaShareAlt,
  FaBookmark,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useListings, Listing } from '../../services/listingsService';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedItems } from '../../services/saved';
import { useNotification } from '../../contexts/NotificationContext';
import { useChat } from '../../services/chatService';
import { carFeatures } from '../../data/carFeatures';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

const smoothEase = CustomEase.create("smooth", "0.6, 0.01, 0.05, 0.95");

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #2d2d2d);
  padding: 40px 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ImageGallery = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ImageSlider = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const SlideButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  svg {
    font-size: 1.5rem;
  }

  &.prev {
    left: 16px;
  }

  &.next {
    right: 16px;
  }
`;

const ThumbnailStrip = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.3);

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const Thumbnail = styled.button<{ active: boolean }>`
  width: 80px;
  height: 60px;
  padding: 0;
  border: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.active ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.5)'};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 2;
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding: 40px;
  color: #fff;
`;

const MainContent = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ListingActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger', fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  ${props => props.variant === 'primary' && `
    background: ${props.theme.colors.primary};
    color: white;
    border: none;

    &:hover {
      background: ${props.theme.colors.primaryDark};
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}

  svg {
    font-size: 1.2rem;
  }
`;

const PriceCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContactCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #ffffff;
  margin: 0 0 32px 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  .char {
    display: inline-block;
    transform-origin: 50% 100%;
  }
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Description = styled.p`
  color: #e0e0e0;
  line-height: 1.6;
  margin: 32px 0;
  font-size: 1.1rem;
  position: relative;
  min-height: 24px;
`;

const Specs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);

  svg {
    font-size: 1.25rem;
    color: #3b82f6;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #ef4444;
  gap: 16px;
  text-align: center;
  padding: 20px;

  h2 {
    font-size: 1.5rem;
    color: #fff;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ContactSection = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContactHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.5rem;
  }

  h3 {
    color: ${props => props.theme.colors.textLight};
    margin: 0;
    font-size: 1.2rem;
  }
`;

const ContactInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactItemSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
  }

  a {
    color: ${props => props.theme.colors.textLight};
    text-decoration: none;
    
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const ContactButtonSection = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const FeaturesSection = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeaturesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.5rem;
  }

  h3 {
    color: ${props => props.theme.colors.textLight};
    margin: 0;
    font-size: 1.2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1rem;
  }
`;

const SpecificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const SpecificationItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
  }

  .label {
    color: ${props => props.theme.colors.textLight};
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .value {
    color: ${props => props.theme.colors.textLight};
    font-weight: 500;
  }
`;

const PriceTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.5rem;
  }
`;

const LocationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  margin-top: 16px;
  color: ${props => props.theme.colors.textLight};

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 1.3rem;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);

  svg {
    font-size: 1.25rem;
    color: #3b82f6;
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      font-size: 32px;
      color: #3b82f6;
    }
  }

  .info {
    h3 {
      color: #fff;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.95rem;
    }
  }
`;

const ContactTitle = styled.h3`
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 16px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
  }

  span, a {
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 500;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const QuickInfoCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  position: sticky;
  top: 24px;
  height: fit-content;
  max-height: calc(100vh - 48px);
  overflow-y: auto;

  h3 {
    color: #ffffff;
    margin: 24px 0 16px 0;
    font-size: 1.3rem;
    font-weight: 600;
    &:first-child {
      margin-top: 0;
    }
  }
`;

const QuickInfoGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const QuickInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .content {
    min-width: 0;
    flex: 1;
  }

  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  .value {
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ListingMeta = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const FadeInSection = styled(motion.div)`
  opacity: 0;
  will-change: transform, opacity;
`;

const SlideUpSection = styled(motion.div)`
  opacity: 0;
  transform: translateY(20px);
  will-change: transform, opacity;
`;

const StaggerGrid = styled(motion.div)`
  opacity: 0;
  will-change: transform, opacity;
`;

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  
  // Refs for animations
  const imageRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const { showNotification } = useNotification();
  const { fetchListing } = useListings();
  const { isSaved, saveListing, removeSavedListing } = useSavedItems();
  const { createChat } = useChat();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular date object or string
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedListing = await fetchListing(id!);
        if (fetchedListing) {
          setListing(fetchedListing);
          document.title = `${fetchedListing.make} ${fetchedListing.model} ${fetchedListing.year} - NCP Wheels`;
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        setError('Error loading listing');
        console.error('Error loading listing:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadListing();
    }

    return () => {
      document.title = 'NCP Wheels';
    };
  }, [id]);

  const handleSaveToggle = async () => {
    if (!user) {
      showNotification('Please log in to save listings', 'info');
      navigate('/auth/login');
      return;
    }

    if (!listing) return;

    try {
      if (saved) {
        await removeSavedListing(listing.id);
        setSaved(false);
        showNotification('Listing removed from saved items', 'success');
      } else {
        await saveListing(listing.id);
        setSaved(true);
        showNotification('Listing saved successfully', 'success');
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      showNotification('Error saving listing', 'error');
    }
  };

  const handleContactClick = async () => {
    if (!user) {
      showNotification('Please log in to contact the seller', 'error');
      return;
    }

    if (!listing) return;

    // Prevent users from chatting with themselves
    if (user.uid === listing.userId) {
      showNotification('You cannot chat with yourself', 'error');
      return;
    }

    try {
      const chatId = await createChat(user.uid, listing.userId, listing.id);
      if (chatId) {
        navigate(`/chat/${chatId}`);
        showNotification('Chat created successfully', 'success');
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      showNotification(error.message || 'Error creating chat', 'error');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [listing?.images]);

  useEffect(() => {
    // Initial animations when component mounts
    if (!loading && listing) {
      // Create a master timeline for coordinated animations
      const masterTimeline = gsap.timeline({
        defaults: {
          ease: smoothEase,
          duration: 1
        }
      });

      // Image gallery animation with parallax effect
      masterTimeline.fromTo(imageRef.current,
        { 
          opacity: 0, 
          x: -100,
          scale: 0.95,
          rotateY: -10
        },
        { 
          opacity: 1, 
          x: 0,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: "power2.out"
        }
      );

      // Info card animation with 3D effect
      masterTimeline.fromTo(infoCardRef.current,
        { 
          opacity: 0, 
          x: 100,
          scale: 0.95,
          rotateY: 10
        },
        { 
          opacity: 1, 
          x: 0,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: "power2.out"
        },
        "-=1" // Start slightly before previous animation ends
      );

      // Stagger the quick info items
      const quickInfoItems = infoCardRef.current?.querySelectorAll('.quick-info-item');
      if (quickInfoItems) {
        masterTimeline.fromTo(quickInfoItems,
          { 
            opacity: 0, 
            y: 20,
            scale: 0.9
          },
          { 
            opacity: 1, 
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "back.out(1.7)"
          },
          "-=0.5"
        );
      }

      // Content animations with scroll triggers
      ScrollTrigger.batch(".feature-item", {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { 
              opacity: 0, 
              y: 20,
              scale: 0.9,
              rotateX: -10
            },
            { 
              opacity: 1, 
              y: 0,
              scale: 1,
              rotateX: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              stagger: 0.1
            }
          );
        },
        once: true
      });

      // Title animation with text split effect
      const titleText = titleRef.current?.textContent || '';
      titleRef.current!.innerHTML = '';
      const chars = titleText.split('');
      
      titleRef.current!.innerHTML = chars
        .map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      masterTimeline.fromTo(".char",
        { 
          opacity: 0,
          y: 50,
          rotateX: -90
        },
        { 
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
          duration: 0.6,
          ease: "back.out(1.7)"
        },
        "-=0.2"
      );

      // Description fade in with gradient
      masterTimeline.fromTo(descriptionRef.current,
        { 
          opacity: 0,
          y: 30,
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)"
        },
        { 
          opacity: 1,
          y: 0,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 0.8,
          ease: "power4.out"
        },
        "+=0.3"
      );

      // Features section animation
      if (featuresRef.current) {
        masterTimeline.fromTo(featuresRef.current,
          { 
            opacity: 0,
            y: 50,
            scale: 0.95
          },
          { 
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.75)"
          },
          "-=0.5"
        );
      }

      // Clean up ScrollTrigger on component unmount
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
  }, [loading, listing]);

  // Enhanced image transition animation
  useEffect(() => {
    if (listing?.images) {
      gsap.fromTo(".slide-image",
        { 
          opacity: 0,
          scale: 1.1,
          rotate: 2
        },
        { 
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.8,
          ease: "power2.out"
        }
      );

      // Animate thumbnails with stagger
      gsap.fromTo(".thumbnail",
        { 
          opacity: 0,
          y: 20,
          scale: 0.8
        },
        { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [currentImageIndex]);

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            Loading listing details...
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ErrorContainer>
            <h2>Error Loading Listing</h2>
            <p>{error}</p>
            <StyledButton onClick={() => navigate('/listings')} variant="primary">
              Return to Listings
            </StyledButton>
          </ErrorContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ErrorContainer>
            <h2>Listing Not Found</h2>
            <p>The listing you're looking for doesn't exist.</p>
            <StyledButton onClick={() => navigate('/listings')} variant="primary">
              Return to Listings
            </StyledButton>
          </ErrorContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const isOwner = user && user.uid === listing.userId;

  return (
    <PageContainer>
      <ContentWrapper>
        <TopSection>
          <FadeInSection
            ref={imageRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ImageGallery>
              <ImageSlider>
                {listing.images && listing.images.length > 0 && (
                  <>
                    <SlideImage 
                      className="slide-image"
                      src={listing.images[currentImageIndex]} 
                      alt={`${listing.title} - Image ${currentImageIndex + 1}`} 
                    />
                    {listing.images.length > 1 && (
                      <>
                        <SlideButton className="prev" onClick={prevImage}>
                          <FaChevronLeft />
                        </SlideButton>
                        <SlideButton className="next" onClick={nextImage}>
                          <FaChevronRight />
                        </SlideButton>
                        <ImageCounter>
                          {currentImageIndex + 1} / {listing.images.length}
                        </ImageCounter>
                      </>
                    )}
                  </>
                )}
                {listing.isFeatured && (
                  <FeaturedBadge>
                    <FaCrown /> Featured
                  </FeaturedBadge>
                )}
              </ImageSlider>
              {listing.images && listing.images.length > 1 && (
                <ThumbnailStrip>
                  {listing.images.map((image, index) => (
                    <Thumbnail
                      key={index}
                      active={index === currentImageIndex}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </Thumbnail>
                  ))}
                </ThumbnailStrip>
              )}
            </ImageGallery>
          </FadeInSection>

          <FadeInSection
            ref={infoCardRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <QuickInfoCard>
              <h3>Price</h3>
              <PriceTag>
                <FaMoneyBill />
                {formatPrice(listing.price)}
              </PriceTag>

              <ListingActionButtons>
                <StyledButton onClick={() => window.navigator.share({ 
                  title: listing.title,
                  text: `Check out this ${listing.make} ${listing.model} on NCP Wheels`,
                  url: window.location.href
                })} variant="secondary">
                  <FaShareAlt /> Share
                </StyledButton>
                <StyledButton
                  onClick={handleSaveToggle}
                  variant="secondary"
                >
                  {saved ? <FaHeart style={{ color: '#ff4757' }} /> : <FaRegHeart />}
                  {saved ? 'Saved' : 'Save'}
                </StyledButton>
              </ListingActionButtons>

              <h3>Vehicle Details</h3>
              <QuickInfoGrid>
                <QuickInfoItem>
                  <FaCar />
                  <div className="content">
                    <div className="label">Make & Model</div>
                    <div className="value">{listing.make} {listing.model}</div>
                  </div>
                </QuickInfoItem>
                <QuickInfoItem>
                  <FaCalendarAlt />
                  <div className="content">
                    <div className="label">Year</div>
                    <div className="value">{listing.year}</div>
                  </div>
                </QuickInfoItem>
                <QuickInfoItem>
                  <FaTachometerAlt />
                  <div className="content">
                    <div className="label">Mileage</div>
                    <div className="value">{listing.mileage.toLocaleString()} km</div>
                  </div>
                </QuickInfoItem>
                <QuickInfoItem>
                  <FaCog />
                  <div className="content">
                    <div className="label">Transmission</div>
                    <div className="value">{listing.transmission}</div>
                  </div>
                </QuickInfoItem>
                <QuickInfoItem>
                  <FaGasPump />
                  <div className="content">
                    <div className="label">Fuel Type</div>
                    <div className="value">{listing.fuelType}</div>
                  </div>
                </QuickInfoItem>
                <QuickInfoItem>
                  <FaMapMarkerAlt />
                  <div className="content">
                    <div className="label">Location</div>
                    <div className="value">{listing.location}</div>
                  </div>
                </QuickInfoItem>
              </QuickInfoGrid>

              {!isOwner && (
                <>
                  <h3>Contact Seller</h3>
                  <ContactInfo>
                    <ContactItem>
                      <FaUser />
                      <span>{listing.seller?.name}</span>
                    </ContactItem>
                    <ContactItem>
                      <FaPhone />
                      <a href={`tel:${listing.seller?.phone}`}>
                        {listing.seller?.phone}
                      </a>
                    </ContactItem>
                    <ContactItem>
                      <FaEnvelope />
                      <a href={`mailto:${listing.seller?.email}`}>
                        {listing.seller?.email}
                      </a>
                    </ContactItem>
                  </ContactInfo>
                  <ContactButtonSection>
                    <StyledButton onClick={() => window.location.href = `tel:${listing.seller?.phone}`} variant="primary">
                      <FaPhone /> Call Seller
                    </StyledButton>
                    <StyledButton onClick={() => window.location.href = `mailto:${listing.seller?.email}`} variant="secondary">
                      <FaEnvelope /> Message
                    </StyledButton>
                  </ContactButtonSection>
                </>
              )}

              {!listing.isFeatured && isOwner && (
                <div style={{ marginTop: '16px' }}>
                  <StyledButton onClick={() => navigate(`/listings/${listing.id}/feature`)} variant="primary" fullWidth>
                    <FaStar /> Feature this Listing
                  </StyledButton>
                </div>
              )}

              <ListingMeta>
                <span>Listed on: {formatDate(listing.createdAt)}</span>
                <span>Last updated: {formatDate(listing.updatedAt)}</span>
                <span>Views: {listing.views || 0}</span>
                <span>Listing ID: {id}</span>
              </ListingMeta>
            </QuickInfoCard>
          </FadeInSection>
        </TopSection>

        <ContentSection>
          <MainContent>
            <SlideUpSection
              ref={titleRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: '24px' }}
            >
              <Title>
                {`${listing.make} ${listing.model} ${listing.year}`}
              </Title>
            </SlideUpSection>

            <SlideUpSection
              ref={descriptionRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ margin: '24px 0' }}
            >
              <Description>{listing.description}</Description>
            </SlideUpSection>

            {listing.features && listing.features.length > 0 && (
              <StaggerGrid
                ref={featuresRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FeaturesSection>
                  <FeaturesHeader>
                    <FaCar />
                    <h3>Features & Equipment</h3>
                  </FeaturesHeader>
                  <FeaturesGrid>
                    {carFeatures
                      .filter(feature => listing.features?.includes(feature.id))
                      .map(feature => (
                        <FeatureItem 
                          key={feature.id}
                          className="feature-item"
                        >
                          <FaCheck />
                          {feature.label}
                        </FeatureItem>
                      ))}
                  </FeaturesGrid>
                </FeaturesSection>
              </StaggerGrid>
            )}
          </MainContent>
        </ContentSection>
      </ContentWrapper>
    </PageContainer>
  );
};
