import React from 'react';
import styled from 'styled-components';
import { seedListings } from '../../utils/seedData';

const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

export const SeedData: React.FC = () => {
  const handleSeed = async () => {
    await seedListings();
  };

  return (
    <Container>
      <Button onClick={handleSeed}>Add Sample Listings</Button>
    </Container>
  );
};
