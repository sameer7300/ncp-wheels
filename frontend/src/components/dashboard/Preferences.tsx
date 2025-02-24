import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaBell, FaGlobe, FaMoon } from 'react-icons/fa';

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

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.25rem;
  margin-bottom: 16px;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
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

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
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
  margin-top: 24px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

export const Preferences: React.FC = () => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Preferences</Title>

      <Card>
        <Section>
          <SectionTitle>
            <FaBell /> Notifications
          </SectionTitle>
          <ToggleContainer>
            <ToggleLabel>Email Notifications</ToggleLabel>
            <Toggle>
              <ToggleInput type="checkbox" defaultChecked />
              <ToggleSlider />
            </Toggle>
          </ToggleContainer>
          <ToggleContainer>
            <ToggleLabel>Push Notifications</ToggleLabel>
            <Toggle>
              <ToggleInput type="checkbox" defaultChecked />
              <ToggleSlider />
            </Toggle>
          </ToggleContainer>
          <ToggleContainer>
            <ToggleLabel>Message Notifications</ToggleLabel>
            <Toggle>
              <ToggleInput type="checkbox" defaultChecked />
              <ToggleSlider />
            </Toggle>
          </ToggleContainer>
        </Section>

        <Section>
          <SectionTitle>
            <FaGlobe /> Language & Region
          </SectionTitle>
          <Select defaultValue="en">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </Select>
        </Section>

        <Section>
          <SectionTitle>
            <FaMoon /> Appearance
          </SectionTitle>
          <ToggleContainer>
            <ToggleLabel>Dark Mode</ToggleLabel>
            <Toggle>
              <ToggleInput type="checkbox" />
              <ToggleSlider />
            </Toggle>
          </ToggleContainer>
        </Section>

        <Button>Save Preferences</Button>
      </Card>
    </Container>
  );
};
