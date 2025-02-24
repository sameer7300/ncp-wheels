import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  bio: z.string().max(500, 'Bio must not exceed 500 characters'),
  facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ProfilePictureSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
`;

const ProfilePicture = styled.div<{ url?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: ${props => props.url ? `url(${props.url})` : props.theme.colors.background};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textLight};
  font-size: 3rem;
`;

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const InputWithIcon = styled.div`
  position: relative;
  
  input {
    padding-left: 36px;
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.textLight};
  }
`;

export const ProfileOverview: React.FC = () => {
  const { showNotification } = useNotification();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Profile updated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement profile picture upload
      showNotification('info', 'Profile picture upload will be implemented soon');
    }
  };

  return (
    <Container>
      <Section>
        <SectionTitle>Profile Overview</SectionTitle>
        
        <ProfilePictureSection>
          <ProfilePicture>
            <FaUser />
          </ProfilePicture>
          <div>
            <Button as="label" htmlFor="profile-picture">
              Change Profile Picture
              <input
                type="file"
                id="profile-picture"
                hidden
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </Button>
          </div>
        </ProfilePictureSection>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGrid>
            <FormGroup>
              <Label>First Name</Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <InputWithIcon>
                    <FaUser />
                    <Input {...field} placeholder="Enter your first name" />
                  </InputWithIcon>
                )}
              />
              {errors.firstName && (
                <ErrorMessage>{errors.firstName.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Last Name</Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <InputWithIcon>
                    <FaUser />
                    <Input {...field} placeholder="Enter your last name" />
                  </InputWithIcon>
                )}
              />
              {errors.lastName && (
                <ErrorMessage>{errors.lastName.message}</ErrorMessage>
              )}
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputWithIcon>
                  <FaEnvelope />
                  <Input {...field} type="email" placeholder="Enter your email" />
                </InputWithIcon>
              )}
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGrid>
            <FormGroup>
              <Label>Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <InputWithIcon>
                    <FaPhone />
                    <Input {...field} placeholder="Enter your phone number" />
                  </InputWithIcon>
                )}
              />
              {errors.phone && (
                <ErrorMessage>{errors.phone.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Location</Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <InputWithIcon>
                    <FaMapMarkerAlt />
                    <Input {...field} placeholder="Enter your location" />
                  </InputWithIcon>
                )}
              />
              {errors.location && (
                <ErrorMessage>{errors.location.message}</ErrorMessage>
              )}
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Bio</Label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextArea {...field} placeholder="Tell us about yourself" />
              )}
            />
          </FormGroup>

          <Section>
            <SectionTitle>Social Media Links</SectionTitle>
            <SocialLinks>
              <FormGroup>
                <Label>Facebook</Label>
                <Controller
                  name="facebook"
                  control={control}
                  render={({ field }) => (
                    <InputWithIcon>
                      <FaFacebook />
                      <Input {...field} placeholder="Facebook profile URL" />
                    </InputWithIcon>
                  )}
                />
                {errors.facebook && (
                  <ErrorMessage>{errors.facebook.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Twitter</Label>
                <Controller
                  name="twitter"
                  control={control}
                  render={({ field }) => (
                    <InputWithIcon>
                      <FaTwitter />
                      <Input {...field} placeholder="Twitter profile URL" />
                    </InputWithIcon>
                  )}
                />
                {errors.twitter && (
                  <ErrorMessage>{errors.twitter.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Instagram</Label>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <InputWithIcon>
                      <FaInstagram />
                      <Input {...field} placeholder="Instagram profile URL" />
                    </InputWithIcon>
                  )}
                />
                {errors.instagram && (
                  <ErrorMessage>{errors.instagram.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>LinkedIn</Label>
                <Controller
                  name="linkedin"
                  control={control}
                  render={({ field }) => (
                    <InputWithIcon>
                      <FaLinkedin />
                      <Input {...field} placeholder="LinkedIn profile URL" />
                    </InputWithIcon>
                  )}
                />
                {errors.linkedin && (
                  <ErrorMessage>{errors.linkedin.message}</ErrorMessage>
                )}
              </FormGroup>
            </SocialLinks>
          </Section>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Section>
    </Container>
  );
};
