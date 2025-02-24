import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const sampleListings = [
  {
    title: '2020 Toyota Camry SE',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb',
    status: 'active',
    views: 0,
    saves: 0,
    messages: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Beautiful 2020 Toyota Camry SE in excellent condition. Low mileage, well maintained, and loaded with features.',
    specifications: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 45000,
      transmission: 'Automatic',
      fuelType: 'Petrol'
    },
    featured: true,
    userId: 'system'
  },
  {
    title: '2019 Honda Civic Sport',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
    status: 'active',
    views: 0,
    saves: 0,
    messages: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Sporty 2019 Honda Civic in great condition. Perfect blend of performance and comfort.',
    specifications: {
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      mileage: 35000,
      transmission: 'Manual',
      fuelType: 'Petrol'
    },
    featured: false,
    userId: 'system'
  }
];

export const seedListings = async () => {
  try {
    const listingsRef = collection(db, 'listings');
    
    for (const listing of sampleListings) {
      await addDoc(listingsRef, listing);
    }
    
    console.log('Sample listings added successfully!');
  } catch (error) {
    console.error('Error adding sample listings:', error);
  }
};
