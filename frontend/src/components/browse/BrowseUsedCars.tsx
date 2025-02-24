import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { FaMapMarkerAlt, FaCarSide } from 'react-icons/fa';
import { BiMoney } from 'react-icons/bi';
import { TbCarSuv, TbSteeringWheel } from 'react-icons/tb';
import { CarLogos } from './CarLogos';
import { useNavigate } from 'react-router-dom';
import { ListingFilters } from '../../services/listingsService';

const Container = styled(motion.div)`
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: white;
  text-align: center;
  background: linear-gradient(to right, #fff, #e0e0e0, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

const CategoryGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  position: relative;
`;

const CategoryCard = styled(motion.div)<{ isOpen: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: visible;
  position: relative;
  z-index: ${props => props.isOpen ? 10 : 1};

  &:hover {
    z-index: 10;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CategoryHeader = styled(motion.div)<{ isOpen: boolean }>`
  padding: 24px;
  background: ${props => props.isOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconWrapper = styled(motion.div)`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const CategoryName = styled.h3`
  font-size: 1.4rem;
  color: white;
  margin: 0;
  font-weight: 600;
`;

const ItemCount = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const SubcategoriesList = styled(motion.div)<{ position: 'right' | 'left' | 'bottom' }>`
  position: absolute;
  ${props => {
    switch (props.position) {
      case 'right':
        return 'left: calc(100% + 10px); top: 0;';
      case 'left':
        return 'right: calc(100% + 10px); top: 0;';
      case 'bottom':
        return 'left: 0; top: calc(100% + 10px);';
    }
  }}
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 5;
  width: max-content;
  min-width: 100%;
  max-width: min(600px, 90vw);
  
  @media (max-width: 1200px) {
    left: 50%;
    transform: translateX(-50%);
    top: calc(100% + 10px);
    width: max-content;
    min-width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SubcategoryItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const BrandLogo = styled.div<{ imageUrl?: string }>`
  width: 24px;
  height: 24px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'rgba(255, 255, 255, 0.1)'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0) invert(1);
`;

const listVariants = {
  hidden: { 
    opacity: 0,
    x: -20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: Array<{
    name: string;
    icon?: React.ReactNode;
    imageUrl?: string;
  }>;
}

const categories: Category[] = [
  {
    id: 'city',
    name: 'City',
    icon: <FaMapMarkerAlt />,
    subcategories: [
      { name: 'Karachi', icon: <FaMapMarkerAlt /> },
      { name: 'Lahore', icon: <FaMapMarkerAlt /> },
      { name: 'Islamabad', icon: <FaMapMarkerAlt /> },
      { name: 'Rawalpindi', icon: <FaMapMarkerAlt /> },
      { name: 'Peshawar', icon: <FaMapMarkerAlt /> },
      { name: 'Faisalabad', icon: <FaMapMarkerAlt /> },
      { name: 'Multan', icon: <FaMapMarkerAlt /> },
      { name: 'Gujranwala', icon: <FaMapMarkerAlt /> },
      { name: 'Sialkot', icon: <FaMapMarkerAlt /> },
      { name: 'Sargodha', icon: <FaMapMarkerAlt /> }
    ]
  },
  {
    id: 'make',
    name: 'Make',
    icon: <FaCarSide />,
    subcategories: [
      // Most Popular Japanese Brands
      { name: 'Toyota', imageUrl: CarLogos.Toyota },
      { name: 'Honda', imageUrl: CarLogos.Honda },
      { name: 'Suzuki', imageUrl: CarLogos.Suzuki },
      { name: 'Nissan', imageUrl: CarLogos.Nissan },
      { name: 'Mitsubishi', imageUrl: CarLogos.Mitsubishi },
      { name: 'Mazda', imageUrl: CarLogos.Mazda },
      
      // Popular Korean Brands
      { name: 'Hyundai', imageUrl: CarLogos.Hyundai },
      { name: 'KIA', imageUrl: CarLogos.KIA },
      
      // Premium European Brands
      { name: 'Mercedes-Benz', imageUrl: CarLogos['Mercedes-Benz'] },
      { name: 'BMW', imageUrl: CarLogos.BMW },
      { name: 'Audi', imageUrl: CarLogos.Audi },
      { name: 'Volkswagen', imageUrl: CarLogos.Volkswagen },
      
      // Chinese Brands
      { name: 'MG', imageUrl: CarLogos.MG },
      { name: 'Haval', imageUrl: CarLogos.Haval },
      
      // American Brands
      { name: 'Chevrolet', imageUrl: CarLogos.Chevrolet },
      { name: 'Ford', imageUrl: CarLogos.Ford },
      { name: 'Jeep', imageUrl: CarLogos.Jeep },
      
      // Commercial Vehicles
      { name: 'Isuzu', imageUrl: CarLogos.Isuzu },
      { name: 'Hino', imageUrl: CarLogos.Hino },
      
      // Luxury Brand
      { name: 'Lexus', imageUrl: CarLogos.Lexus },
      { name: 'Porsche', imageUrl: CarLogos.Porsche }
    ]
  },
  {
    id: 'bodyType',
    name: 'Body Type',
    icon: <TbCarSuv />,
    subcategories: [
      { name: 'Hatchback', icon: <FaCarSide /> },
      { name: 'Sedan', icon: <FaCarSide /> },
      { name: 'SUV', icon: <TbCarSuv /> },
      { name: 'Crossover', icon: <TbCarSuv /> },
      { name: 'Mini Van', icon: <FaCarSide /> },
      { name: 'Van', icon: <FaCarSide /> },
      { name: 'Compact SUV', icon: <TbCarSuv /> },
      { name: 'MPV', icon: <FaCarSide /> },
      { name: 'Compact sedan', icon: <FaCarSide /> },
      { name: 'Double Cabin', icon: <FaCarSide /> }
    ]
  },
  {
    id: 'budget',
    name: 'Budget',
    icon: <BiMoney />,
    subcategories: [
      { name: 'under 5 lakh', icon: <BiMoney /> },
      { name: '5-10 lakh', icon: <BiMoney /> },
      { name: '10-20 lakh', icon: <BiMoney /> },
      { name: '20-30 lakh', icon: <BiMoney /> },
      { name: '30-40 lakh', icon: <BiMoney /> },
      { name: '40-50 lakh', icon: <BiMoney /> },
      { name: '50-60 lakh', icon: <BiMoney /> },
      { name: '60-80 lakh', icon: <BiMoney /> },
      { name: '80 lakh-1 crore', icon: <BiMoney /> },
      { name: 'above 1 crore', icon: <BiMoney /> }
    ]
  }
];

export const BrowseUsedCars: React.FC = () => {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'right' | 'left' | 'bottom'>('right');
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverDelayRef = useRef<NodeJS.Timeout | null>(null);

  const updateDropdownPosition = (cardId: string) => {
    const card = cardRefs.current[cardId];
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const spaceRight = viewportWidth - cardRect.right;
    const spaceLeft = cardRect.left;
    const dropdownWidth = Math.min(600, window.innerWidth * 0.9);

    if (spaceRight >= dropdownWidth + 10) {
      setDropdownPosition('right');
    } else if (spaceLeft >= dropdownWidth + 10) {
      setDropdownPosition('left');
    } else {
      setDropdownPosition('bottom');
    }
  };

  const handleMouseEnter = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }

    // Add a small delay before opening to prevent accidental triggers
    hoverDelayRef.current = setTimeout(() => {
      updateDropdownPosition(categoryId);
      setHoveredCategory(categoryId);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }
    
    // Add a delay before closing to allow moving to the dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handleDropdownMouseEnter = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(categoryId);
  };

  const handleDropdownMouseLeave = (immediate: boolean = false) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    const delay = immediate ? 0 : 300;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, delay);
  };

  const toggleCategory = (categoryId: string) => {
    // Clear any hover states when clicking
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }
    setHoveredCategory(null);

    updateDropdownPosition(categoryId);
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [categoryId]
    );
  };

  const handleSubcategoryClick = (category: Category, subcategory: { name: string }) => {
    let filters: ListingFilters = {};

    switch (category.id) {
      case 'city':
        // Handle body type filters
        filters = {
          searchQuery: subcategory.name
        };
        break;

      case 'budget':
        // Handle budget ranges
        const priceRange = subcategory.name.toLowerCase();
        if (priceRange.includes('under')) {
          filters.maxPrice = 500000; // 5 lakh
        } else if (priceRange.includes('above')) {
          filters.minPrice = 10000000; // 1 crore
        } else {
          const [min, max] = priceRange.split('-')
            .map(part => {
              const numStr = part.trim().split(' ')[0];
              return parseInt(numStr) * 100000; // Convert lakh to actual number
            });
          filters.minPrice = min;
          filters.maxPrice = max;
        }
        break;

      case 'make':
        // Handle make/model filters
        filters = {
          make: subcategory.name
        };
        break;

      case 'location':
        // Handle location filters
        filters = {
          location: subcategory.name
        };
        break;
    }

    // Convert filters to URL parameters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    // Navigate to listings page with filters
    navigate(`/listings?${params.toString()}`);
  };

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      const activeCategory = openCategories[0] || hoveredCategory;
      if (activeCategory) {
        updateDropdownPosition(activeCategory);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openCategories, hoveredCategory]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hoverDelayRef.current) {
        clearTimeout(hoverDelayRef.current);
      }
    };
  }, []);

  const isActive = (categoryId: string) => 
    openCategories.includes(categoryId) || hoveredCategory === categoryId;

  return (
    <Container>
      <Title></Title>
      <CategoryGrid>
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            ref={el => cardRefs.current[category.id] = el}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            isOpen={isActive(category.id)}
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={() => handleMouseLeave()}
          >
            <CategoryHeader
              isOpen={isActive(category.id)}
              onClick={() => toggleCategory(category.id)}
            >
              <HeaderContent>
                <div>
                  <IconWrapper
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.icon}
                  </IconWrapper>
                  <CategoryName>{category.name}</CategoryName>
                  <ItemCount>{category.subcategories.length} options</ItemCount>
                </div>
                <motion.div
                  animate={{ rotate: isActive(category.id) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown color="white" size={24} />
                </motion.div>
              </HeaderContent>
            </CategoryHeader>

            <AnimatePresence>
              {isActive(category.id) && (
                <SubcategoriesList
                  position={dropdownPosition}
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  onMouseEnter={() => handleDropdownMouseEnter(category.id)}
                  onMouseLeave={() => handleDropdownMouseLeave()}
                >
                  {category.subcategories.map((subcategory, index) => (
                    <SubcategoryItem
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubcategoryClick(category, subcategory)}
                    >
                      {subcategory.imageUrl ? (
                        <BrandLogo imageUrl={subcategory.imageUrl} />
                      ) : (
                        subcategory.icon
                      )}
                      {subcategory.name}
                    </SubcategoryItem>
                  ))}
                </SubcategoriesList>
              )}
            </AnimatePresence>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </Container>
  );
};

export default BrowseUsedCars;
