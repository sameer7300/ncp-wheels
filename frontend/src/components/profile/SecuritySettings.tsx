import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaLock, FaShieldAlt, FaMobileAlt, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';

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
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${props => props.theme.colors.primary};
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

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  width: 48px;
  height: 24px;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    transition: left 0.2s;
  }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
`;

const SessionInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const SessionDetails = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
`;

const SessionStatus = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.active ? props.theme.colors.success : props.theme.colors.textLight};
  font-size: 0.875rem;
`;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SecuritySettings: React.FC = () => {
  const { showNotification } = useNotification();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Password changed successfully');
      reset();
    } catch (error) {
      showNotification('error', 'Failed to change password');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      // TODO: Implement 2FA toggle API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      showNotification('success', `Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      showNotification('error', 'Failed to update two-factor authentication');
    }
  };

  // Mock session data
  const sessions = [
    {
      device: 'Chrome on Windows',
      location: 'Karachi, Pakistan',
      lastActive: 'Current session',
      isActive: true
    },
    {
      device: 'Safari on iPhone',
      location: 'Karachi, Pakistan',
      lastActive: '2 hours ago',
      isActive: false
    },
    {
      device: 'Firefox on MacOS',
      location: 'Lahore, Pakistan',
      lastActive: '1 day ago',
      isActive: false
    }
  ];

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaLock /> Change Password
        </SectionTitle>
        <form onSubmit={handleSubmit(onPasswordSubmit)}>
          <FormGroup>
            <Label>Current Password</Label>
            <Input
              type="password"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <ErrorMessage>{errors.currentPassword.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>New Password</Label>
            <Input
              type="password"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
            )}
          </FormGroup>

          <Button type="submit">Change Password</Button>
        </form>
      </Section>

      <Section>
        <SectionTitle>
          <FaShieldAlt /> Two-Factor Authentication
        </SectionTitle>
        <Toggle>
          <ToggleSwitch checked={twoFactorEnabled} onClick={handleTwoFactorToggle} />
          <span>Enable two-factor authentication</span>
        </Toggle>
        {twoFactorEnabled && (
          <p style={{ marginTop: '16px', color: '#666' }}>
            Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <FaHistory /> Login History
        </SectionTitle>
        <SessionList>
          {sessions.map((session, index) => (
            <SessionItem key={index}>
              <SessionInfo>
                <SessionTitle>{session.device}</SessionTitle>
                <SessionDetails>
                  {session.location} • {session.lastActive}
                </SessionDetails>
              </SessionInfo>
              <SessionStatus active={session.isActive}>
                {session.isActive ? (
                  <>
                    <FaCheckCircle /> Current session
                  </>
                ) : (
                  <>
                    <FaTimesCircle /> Inactive
                  </>
                )}
              </SessionStatus>
            </SessionItem>
          ))}
        </SessionList>
      </Section>
    </Container>
  );
};
