import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaGlobe, FaDollarSign, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { PreferencesData, getUserPreferences, updateUserPreferences } from '../../services/preferencesService';

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

const SettingGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 12px;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 12px;
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

const Select = styled.select`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;

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
  margin-top: 24px;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
`;

export const Preferences: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const userPreferences = await getUserPreferences(user.uid);
        setPreferences(userPreferences);
      } catch (error) {
        showNotification('error', 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleNotificationToggle = (id: string) => {
    if (!preferences) return;
    
    setPreferences(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === id
            ? { ...notification, enabled: !notification.enabled }
            : notification
        )
      };
    });
  };

  const handlePrivacyToggle = (setting: keyof typeof preferences.privacySettings) => {
    if (!preferences) return;

    setPreferences(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [setting]: !prev.privacySettings[setting]
        }
      };
    });
  };

  const handleSavePreferences = async () => {
    if (!user || !preferences) return;

    try {
      await updateUserPreferences(user.uid, preferences);
      showNotification('success', 'Preferences saved successfully');
    } catch (error) {
      showNotification('error', 'Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <FaSpinner className="spin" size={48} />
          <p>Loading preferences...</p>
        </LoadingState>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container>
        <ErrorState>
          <h3>Error Loading Preferences</h3>
          <p>Unable to load your preferences. Please try again later.</p>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaBell /> Email Notifications
        </SectionTitle>
        {preferences.notifications.map(notification => (
          <SettingGroup key={notification.id}>
            <Toggle>
              <ToggleSwitch
                checked={notification.enabled}
                onClick={() => handleNotificationToggle(notification.id)}
              />
              <div>
                <SettingLabel>{notification.label}</SettingLabel>
                <SettingDescription>{notification.description}</SettingDescription>
              </div>
            </Toggle>
          </SettingGroup>
        ))}
      </Section>

      <Section>
        <SectionTitle>
          <FaGlobe /> Language Settings
        </SectionTitle>
        <SettingGroup>
          <SettingLabel>Display Language</SettingLabel>
          <SettingDescription>Choose your preferred language for the interface</SettingDescription>
          <Select
            value={preferences.language}
            onChange={e => setPreferences(prev => prev ? { ...prev, language: e.target.value } : prev)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="ar">Arabic</option>
          </Select>
        </SettingGroup>
      </Section>

      <Section>
        <SectionTitle>
          <FaDollarSign /> Currency Display
        </SectionTitle>
        <SettingGroup>
          <SettingLabel>Preferred Currency</SettingLabel>
          <SettingDescription>Choose your preferred currency for prices</SettingDescription>
          <Select
            value={preferences.currency}
            onChange={e => setPreferences(prev => prev ? { ...prev, currency: e.target.value } : prev)}
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="PKR">Pakistani Rupee (PKR)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
          </Select>
        </SettingGroup>
      </Section>

      <Section>
        <SectionTitle>
          <FaShieldAlt /> Privacy Settings
        </SectionTitle>
        <SettingGroup>
          <Toggle>
            <ToggleSwitch
              checked={preferences.privacySettings.profileVisibility}
              onClick={() => handlePrivacyToggle('profileVisibility')}
            />
            <div>
              <SettingLabel>Profile Visibility</SettingLabel>
              <SettingDescription>Make your profile visible to other users</SettingDescription>
            </div>
          </Toggle>
        </SettingGroup>

        <SettingGroup>
          <Toggle>
            <ToggleSwitch
              checked={preferences.privacySettings.showEmail}
              onClick={() => handlePrivacyToggle('showEmail')}
            />
            <div>
              <SettingLabel>Show Email</SettingLabel>
              <SettingDescription>Display your email address on your profile</SettingDescription>
            </div>
          </Toggle>
        </SettingGroup>

        <SettingGroup>
          <Toggle>
            <ToggleSwitch
              checked={preferences.privacySettings.showPhone}
              onClick={() => handlePrivacyToggle('showPhone')}
            />
            <div>
              <SettingLabel>Show Phone Number</SettingLabel>
              <SettingDescription>Display your phone number on your profile</SettingDescription>
            </div>
          </Toggle>
        </SettingGroup>
      </Section>

      <Button onClick={handleSavePreferences}>Save Preferences</Button>
    </Container>
  );
};
