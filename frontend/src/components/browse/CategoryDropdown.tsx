import React from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 1000;
  min-width: 720px;
  
  &:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
    filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.1));
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  padding: 8px;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 12px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const IconContainer = styled.div<{ hasImage: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  svg {
    width: 24px;
    height: 24px;
    color: #666;
  }
`;

const ItemName = styled.span`
  font-size: 12px;
  color: #333;
  text-align: center;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

interface CategoryItem {
  name: string;
  icon?: React.ReactNode;
  imageUrl?: string;
}

interface CategoryDropdownProps {
  items: CategoryItem[];
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ items }) => {
  return (
    <DropdownContainer>
      <ItemsGrid>
        {items.map((item, index) => (
          <ItemContainer key={index} onClick={() => console.log('Selected:', item.name)}>
            <IconContainer hasImage={!!item.imageUrl}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                item.icon
              )}
            </IconContainer>
            <ItemName>{item.name}</ItemName>
          </ItemContainer>
        ))}
      </ItemsGrid>
    </DropdownContainer>
  );
};

export default CategoryDropdown;
