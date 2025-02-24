import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCar, FaCrown, FaPlus, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadImages } from '../../services/storageService';

const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(0, 0, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(0, 0, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  input {
    display: none;
  }
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PreviewImage = styled.div<{ $url: string }>`
  width: 100%;
  padding-bottom: 100%;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    font-size: 1.4rem;
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FeatureSection = styled.div`
  background: rgba(31, 41, 55, 0.7);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 24px;
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    color: #ffd700;
    font-size: 1.5rem;
  }

  h3 {
    color: ${props => props.theme.colors.textLight};
    margin: 0;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FeatureOption = styled.div<{ $selected?: boolean }>`
  background: rgba(31, 41, 55, 0.7);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .price {
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .duration {
    color: ${props => props.theme.colors.textLight};
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    mileage: '',
    year: new Date().getFullYear().toString(),
    make: '',
    model: '',
    transmission: '',
    fuelType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previews.length > 10) {
      alert('You can only upload up to 10 images');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages(selectedFiles);

      // Create listing document
      const listingData = {
        ...formData,
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        year: Number(formData.year),
        images: imageUrls,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        views: 0,
        saves: 0,
        featured: selectedFeature !== null,
        specifications: {
          transmission: formData.transmission,
          fuelType: formData.fuelType
        }
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);

      // If feature was selected, redirect to payment page
      if (selectedFeature) {
        navigate(`/listings/${docRef.id}/feature`);
      } else {
        navigate(`/listings/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Title</Label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., 2019 Honda Civic - Excellent Condition"
          />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Describe your vehicle in detail..."
          />
        </FormGroup>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <FormGroup>
            <Label>Price (PKR)</Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="e.g., 2500000"
            />
          </FormGroup>

          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="e.g., Lahore, Punjab"
            />
          </FormGroup>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <FormGroup>
            <Label>Make</Label>
            <Input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              required
              placeholder="e.g., Honda"
            />
          </FormGroup>

          <FormGroup>
            <Label>Model</Label>
            <Input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              placeholder="e.g., Civic"
            />
          </FormGroup>

          <FormGroup>
            <Label>Year</Label>
            <Input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </FormGroup>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <FormGroup>
            <Label>Mileage (km)</Label>
            <Input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="e.g., 50000"
            />
          </FormGroup>

          <FormGroup>
            <Label>Transmission</Label>
            <Input
              type="text"
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              placeholder="e.g., Automatic"
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label>Fuel Type</Label>
          <Input
            type="text"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            placeholder="e.g., Petrol"
          />
        </FormGroup>

        <FormGroup>
          <Label>Images (Max 10)</Label>
          <ImageUploadContainer onClick={() => document.getElementById('imageInput')?.click()}>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <FaUpload size={32} color="#666" />
            <p style={{ color: '#666', marginTop: '12px' }}>
              Click to upload images or drag and drop
            </p>
          </ImageUploadContainer>
          {previews.length > 0 && (
            <PreviewGrid>
              {previews.map((preview, index) => (
                <PreviewImage key={index} $url={preview}>
                  <button type="button" onClick={() => removeImage(index)}>&times;</button>
                </PreviewImage>
              ))}
            </PreviewGrid>
          )}
        </FormGroup>

        <FeatureSection>
          <FeatureHeader>
            <FaCrown />
            <h3>Feature Your Listing</h3>
          </FeatureHeader>
          <p style={{ color: '#fff', marginBottom: '24px' }}>
            Get more visibility and sell your car faster by featuring your listing
          </p>
          <FeatureGrid>
            <FeatureOption
              $selected={selectedFeature === '1week'}
              onClick={() => setSelectedFeature(prev => prev === '1week' ? null : '1week')}
            >
              <div className="price">PKR 300</div>
              <div className="duration">1 Week Featured</div>
            </FeatureOption>
            <FeatureOption
              $selected={selectedFeature === '2weeks'}
              onClick={() => setSelectedFeature(prev => prev === '2weeks' ? null : '2weeks')}
            >
              <div className="price">PKR 500</div>
              <div className="duration">2 Weeks Featured</div>
            </FeatureOption>
            <FeatureOption
              $selected={selectedFeature === '1month'}
              onClick={() => setSelectedFeature(prev => prev === '1month' ? null : '1month')}
            >
              <div className="price">PKR 1000</div>
              <div className="duration">1 Month Featured</div>
            </FeatureOption>
          </FeatureGrid>
        </FeatureSection>

        <CreateButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner /> Creating Listing...
            </>
          ) : (
            <>
              <FaPlus /> Create Listing
            </>
          )}
        </CreateButton>
      </Form>
    </Container>
  );
};
