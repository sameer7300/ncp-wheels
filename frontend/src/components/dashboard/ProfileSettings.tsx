import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Profile Settings</Title>

      <Card>
        <FormGroup>
          <Label>Email</Label>
          <Input type="email" value={user?.email || ''} disabled />
        </FormGroup>

        <FormGroup>
          <Label>Display Name</Label>
          <Input type="text" placeholder="Enter your display name" />
        </FormGroup>

        <FormGroup>
          <Label>Phone Number</Label>
          <Input type="tel" placeholder="Enter your phone number" />
        </FormGroup>

        <Button>Save Changes</Button>
      </Card>
    </Container>
  );
};
