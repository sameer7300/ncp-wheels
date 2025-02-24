import React from 'react';
import styled from 'styled-components';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #1a1a1a;
  color: #fff;
  padding: 48px 0 24px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #fff;
    font-size: 18px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 12px;
  }

  a {
    color: #b3b3b3;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;

    &:hover {
      color: #fff;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b3b3b3;
  margin-bottom: 12px;
  font-size: 14px;

  svg {
    color: #fff;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;

  a {
    color: #fff;
    font-size: 20px;
    transition: color 0.2s ease;

    &:hover {
      color: #007bff;
    }
  }
`;

const BottomBar = styled.div`
  border-top: 1px solid #333;
  padding-top: 24px;
  text-align: center;
  color: #b3b3b3;
  font-size: 14px;
`;

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>About NCP Wheels</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/team">Our Team</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/press">Press & Media</a></li>
              <li><a href="/testimonials">Testimonials</a></li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Buy & Sell</h3>
            <ul>
              <li><a href="/post-ad">Post an Ad</a></li>
              <li><a href="/used-cars">Used Cars</a></li>
              <li><a href="/new-cars">New Cars</a></li>
              <li><a href="/car-insurance">Car Insurance</a></li>
              <li><a href="/car-financing">Car Financing</a></li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Resources</h3>
            <ul>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/car-reviews">Car Reviews</a></li>
              <li><a href="/car-comparison">Car Comparison</a></li>
              <li><a href="/car-prices">Car Prices</a></li>
              <li><a href="/help">Help Center</a></li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Contact Us</h3>
            <ContactInfo>
              <FaPhone />
              <span>+92 300 1234567</span>
            </ContactInfo>
            <ContactInfo>
              <FaEnvelope />
              <span>contact@ncpwheels.com</span>
            </ContactInfo>
            <ContactInfo>
              <FaMapMarkerAlt />
              <span>123 Main Street, Karachi, Pakistan</span>
            </ContactInfo>
            <SocialLinks>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </SocialLinks>
          </FooterSection>
        </FooterGrid>

        <BottomBar>
          <p>&copy; {new Date().getFullYear()} NCP Wheels. All rights reserved.</p>
        </BottomBar>
      </FooterContent>
    </FooterContainer>
  );
};
