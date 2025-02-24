import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaCamera, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { carMakes } from '../../data/carData';
import { carFeatures } from '../../data/carFeatures';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { uploadImages } from '../../services/storageService';
import { v4 as uuidv4 } from 'uuid';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  color: #fff;
  padding: 40px 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FormContainer = styled(motion.div)`
  background: rgba(30, 30, 30, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 40px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div<{ error?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${props => props.error && `
    input, select, textarea {
      border-color: #ef4444;
    }
  `}
`;

const Label = styled.label`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.1);
  }

  option {
    background: #1a1a1a;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ImageUploadSection = styled.div`
  margin-bottom: 32px;
`;

const ImageUploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  border-color: ${props => props.isDragging ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)'};

  &:hover {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  input {
    display: none;
  }
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const PreviewImage = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    transition: all 0.3s ease;

    &:hover {
      background: #dc2626;
    }
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SubmitButton = styled.button<{ isValid: boolean }>`
  background: ${props => props.isValid 
    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.isValid ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: ${props => props.isValid ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.isValid ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'};
  }
`;

const ProgressBar = styled(motion.div)`
  height: 4px;
  background: #3b82f6;
  margin-top: 8px;
  border-radius: 2px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const FeatureCheckbox = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: ${props => props.$selected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${props => props.$selected ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$selected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  }

  svg {
    color: ${props => props.$selected ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.5)'};
  }
`;

interface FormData {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  location: string;
  description: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
}

interface FormErrors {
  [key: string]: string;
}

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMake, setSelectedMake] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    transmission: '',
    fuelType: '',
    location: '',
    description: '',
    sellerName: user?.displayName || '',
    sellerEmail: user?.email || '',
    sellerPhone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year || !/^\d{4}$/.test(formData.year)) {
      newErrors.year = 'Enter a valid year';
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      newErrors.price = 'Enter a valid price';
    }
    if (!formData.mileage || isNaN(Number(formData.mileage))) {
      newErrors.mileage = 'Enter valid mileage';
    }
    if (!formData.transmission) newErrors.transmission = 'Transmission is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!formData.sellerName) newErrors.sellerName = 'Seller name is required';
    if (!formData.sellerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sellerEmail)) {
      newErrors.sellerEmail = 'Enter a valid email address';
    }
    if (!formData.sellerPhone || !/^\+?[0-9]{10,}$/.test(formData.sellerPhone)) {
      newErrors.sellerPhone = 'Enter a valid phone number';
    }
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const make = e.target.value;
    setSelectedMake(make);
    const makeData = carMakes.find(m => m.name === make);
    setAvailableModels(makeData?.models || []);
    setFormData(prev => ({ ...prev, make, model: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files);
    const validImages = newImages.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length + images.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    setImages(prev => [...prev, ...validImages]);
    
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const imageUrls = await uploadImages(images);

      const listingData = {
        ...formData,
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        year: Number(formData.year),
        images: imageUrls,
        userId: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        views: 0,
        saves: 0,
        featured: false,
        specifications: {
          transmission: formData.transmission,
          fuelType: formData.fuelType
        },
        features: selectedFeatures,
        seller: {
          name: formData.sellerName,
          email: formData.sellerEmail,
          phone: formData.sellerPhone,
          userId: user?.uid
        }
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);
      navigate(`/listings/${docRef.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({ ...prev, submit: 'Error creating listing. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <FormContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Title>Create New Listing</Title>
          <Subtitle>Fill in the details to list your car for sale</Subtitle>

          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormSection>
                <InputGroup error={!!errors.make}>
                  <Label>Make</Label>
                  <Select
                    name="make"
                    value={formData.make}
                    onChange={handleMakeChange}
                  >
                    <option value="">Select Make</option>
                    {carMakes.map(make => (
                      <option key={make.name} value={make.name}>
                        {make.name}
                      </option>
                    ))}
                  </Select>
                  {errors.make && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.make}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.model}>
                  <Label>Model</Label>
                  <Select
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    disabled={!formData.make}
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </Select>
                  {errors.model && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.model}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.year}>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.year && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.year}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.price}>
                  <Label>Price (PKR)</Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 2500000"
                  />
                  {errors.price && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.price}
                    </ErrorMessage>
                  )}
                </InputGroup>
              </FormSection>

              <FormSection>
                <InputGroup error={!!errors.mileage}>
                  <Label>Mileage (km)</Label>
                  <Input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                  />
                  {errors.mileage && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.mileage}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.transmission}>
                  <Label>Transmission</Label>
                  <Select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </Select>
                  {errors.transmission && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.transmission}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.fuelType}>
                  <Label>Fuel Type</Label>
                  <Select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </Select>
                  {errors.fuelType && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.fuelType}
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup error={!!errors.location}>
                  <Label>Location</Label>
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Lahore, Punjab"
                  />
                  {errors.location && (
                    <ErrorMessage>
                      <FaExclamationCircle /> {errors.location}
                    </ErrorMessage>
                  )}
                </InputGroup>
              </FormSection>
            </FormGrid>

            <FormSection>
              <InputGroup error={!!errors.sellerName}>
                <Label>Seller Name</Label>
                <Input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
                {errors.sellerName && (
                  <ErrorMessage>
                    <FaExclamationCircle /> {errors.sellerName}
                  </ErrorMessage>
                )}
              </InputGroup>

              <InputGroup error={!!errors.sellerEmail}>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
                {errors.sellerEmail && (
                  <ErrorMessage>
                    <FaExclamationCircle /> {errors.sellerEmail}
                  </ErrorMessage>
                )}
              </InputGroup>

              <InputGroup error={!!errors.sellerPhone}>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleInputChange}
                  placeholder="+92 300 1234567"
                />
                {errors.sellerPhone && (
                  <ErrorMessage>
                    <FaExclamationCircle /> {errors.sellerPhone}
                  </ErrorMessage>
                )}
              </InputGroup>
            </FormSection>

            <InputGroup error={!!errors.description}>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about your car..."
              />
              {errors.description && (
                <ErrorMessage>
                  <FaExclamationCircle /> {errors.description}
                </ErrorMessage>
              )}
            </InputGroup>

            <FormSection>
              <InputGroup>
                <Label>Features</Label>
                <FeaturesGrid>
                  {carFeatures.map(feature => (
                    <FeatureCheckbox
                      key={feature.id}
                      $selected={selectedFeatures.includes(feature.id)}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <FaCheck 
                        style={{ 
                          opacity: selectedFeatures.includes(feature.id) ? 1 : 0.3,
                          width: '16px',
                          height: '16px'
                        }} 
                      />
                      {feature.label}
                    </FeatureCheckbox>
                  ))}
                </FeaturesGrid>
              </InputGroup>

              <InputGroup>
                <Label>Featured Listing</Label>
                <FeatureCheckbox
                  $selected={isFeatured}
                  onClick={() => setIsFeatured(!isFeatured)}
                >
                  Make this a featured listing
                </FeatureCheckbox>
              </InputGroup>
            </FormSection>

            <ImageUploadSection>
              <Label>
                <FaCamera /> Photos
              </Label>
              <ImageUploadArea
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload size={24} color="#3b82f6" />
                <p>Drag & drop images here or click to select</p>
                <span>Maximum 10 images, PNG or JPG</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
              </ImageUploadArea>
              {errors.images && (
                <ErrorMessage>
                  <FaExclamationCircle /> {errors.images}
                </ErrorMessage>
              )}
              <AnimatePresence>
                <PreviewGrid>
                  {previews.map((preview, index) => (
                    <PreviewImage
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button onClick={() => removeImage(index)}>
                        <FaTimes />
                      </button>
                    </PreviewImage>
                  ))}
                </PreviewGrid>
              </AnimatePresence>
            </ImageUploadSection>

            <SubmitButton
              type="submit"
              isValid={Object.keys(errors).length === 0}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⌛
                  </motion.div>
                  Creating Listing...
                </>
              ) : (
                <>
                  <FaCheck /> Create Listing
                </>
              )}
            </SubmitButton>
            {isSubmitting && (
              <ProgressBar
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            )}
          </form>
        </FormContainer>
      </ContentWrapper>
    </PageContainer>
  );
};
