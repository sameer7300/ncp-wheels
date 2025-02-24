import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/logo-ncp-wheels/logo.png';

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
`;

const LogoImg = styled.img`
  height: 90px;
  width: auto;

  @media (max-width: 768px) {
    height: 70px;
  }
`;

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <LogoContainer to="/" className={className}>
      <LogoImg src={logoImage} alt="NCP Wheels Logo" />
    </LogoContainer>
  );
};
