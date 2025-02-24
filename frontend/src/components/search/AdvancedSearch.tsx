import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaMapMarkerAlt, FaBell, FaSave, FaSliders } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const SearchForm = styled.form`
  display: grid;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: start;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
`;

const RangeDivider = styled.span`
  color: ${props => props.theme.colors.textLight};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    &:hover {
      background: ${props.theme.colors.primaryDark};
    }
  ` : `
    background: ${props.theme.colors.background};
    color: ${props.theme.colors.text};
    &:hover {
      background: ${props.theme.colors.backgroundHover};
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const RadiusInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 40px;
  }

  span {
    position: absolute;
    right: 12px;
    color: ${props => props.theme.colors.textLight};
    font-size: 0.875rem;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Switch = styled.div<{ checked: boolean }>`
  width: 40px;
  height: 20px;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;

  &:before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '22px' : '2px'};
    transition: left 0.2s;
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

interface SearchCriteria {
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  radius: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  priceAlerts: boolean;
  saveSearch: boolean;
}

export const AdvancedSearch: React.FC = () => {
  const { showNotification } = useNotification();
  const [criteria, setCriteria] = useState<SearchCriteria>({
    make: '',
    model: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    radius: '50',
    bodyType: '',
    transmission: '',
    fuelType: '',
    priceAlerts: false,
    saveSearch: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof SearchCriteria) => {
    setCriteria(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement search API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Search criteria applied');
    } catch (error) {
      showNotification('error', 'Failed to apply search criteria');
    }
  };

  const handleSaveSearch = async () => {
    try {
      // TODO: Implement save search API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Search criteria saved');
    } catch (error) {
      showNotification('error', 'Failed to save search criteria');
    }
  };

  return (
    <Container>
      <SearchForm onSubmit={handleSearch}>
        <FormGroup>
          <FormRow>
            <div>
              <Label>Make</Label>
              <Select name="make" value={criteria.make} onChange={handleInputChange}>
                <option value="">All Makes</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="audi">Audi</option>
                <option value="toyota">Toyota</option>
                <option value="honda">Honda</option>
              </Select>
            </div>

            <div>
              <Label>Model</Label>
              <Select name="model" value={criteria.model} onChange={handleInputChange}>
                <option value="">All Models</option>
                {/* Models will be populated based on selected make */}
              </Select>
            </div>
          </FormRow>

          <FormRow>
            <div>
              <Label>Year Range</Label>
              <RangeContainer>
                <Input
                  type="number"
                  name="minYear"
                  placeholder="From"
                  value={criteria.minYear}
                  onChange={handleInputChange}
                />
                <RangeDivider>-</RangeDivider>
                <Input
                  type="number"
                  name="maxYear"
                  placeholder="To"
                  value={criteria.maxYear}
                  onChange={handleInputChange}
                />
              </RangeContainer>
            </div>

            <div>
              <Label>Price Range</Label>
              <RangeContainer>
                <Input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={criteria.minPrice}
                  onChange={handleInputChange}
                />
                <RangeDivider>-</RangeDivider>
                <Input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={criteria.maxPrice}
                  onChange={handleInputChange}
                />
              </RangeContainer>
            </div>
          </FormRow>

          <FormRow>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                placeholder="Enter city or postal code"
                value={criteria.location}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>Search Radius</Label>
              <RadiusInput>
                <Input
                  type="number"
                  name="radius"
                  value={criteria.radius}
                  onChange={handleInputChange}
                  min="0"
                  max="500"
                />
                <span>km</span>
              </RadiusInput>
            </div>
          </FormRow>

          <FormRow>
            <div>
              <Label>Body Type</Label>
              <Select name="bodyType" value={criteria.bodyType} onChange={handleInputChange}>
                <option value="">All Types</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="coupe">Coupe</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </Select>
            </div>

            <div>
              <Label>Transmission</Label>
              <Select name="transmission" value={criteria.transmission} onChange={handleInputChange}>
                <option value="">All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </Select>
            </div>

            <div>
              <Label>Fuel Type</Label>
              <Select name="fuelType" value={criteria.fuelType} onChange={handleInputChange}>
                <option value="">All</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </Select>
            </div>
          </FormRow>
        </FormGroup>

        <FormGroup>
          <FormRow>
            <ToggleSwitch>
              <Switch
                checked={criteria.priceAlerts}
                onClick={() => handleToggleChange('priceAlerts')}
              />
              <ToggleLabel>
                <FaBell /> Enable Price Alerts
              </ToggleLabel>
            </ToggleSwitch>

            <ToggleSwitch>
              <Switch
                checked={criteria.saveSearch}
                onClick={() => handleToggleChange('saveSearch')}
              />
              <ToggleLabel>
                <FaSave /> Save Search Criteria
              </ToggleLabel>
            </ToggleSwitch>
          </FormRow>
        </FormGroup>

        <ButtonGroup>
          <Button type="reset" onClick={() => setCriteria({
            make: '',
            model: '',
            minYear: '',
            maxYear: '',
            minPrice: '',
            maxPrice: '',
            location: '',
            radius: '50',
            bodyType: '',
            transmission: '',
            fuelType: '',
            priceAlerts: false,
            saveSearch: false
          })}>
            Clear All
          </Button>
          <Button type="submit" variant="primary">
            <FaSearch /> Search
          </Button>
          {criteria.saveSearch && (
            <Button type="button" onClick={handleSaveSearch}>
              <FaSave /> Save Search
            </Button>
          )}
        </ButtonGroup>
      </SearchForm>
    </Container>
  );
};
