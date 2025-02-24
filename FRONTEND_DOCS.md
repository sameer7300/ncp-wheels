# NCP Wheels Frontend Documentation

## API Services and Endpoints

### 1. Authentication API (`/api/auth`)

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

Endpoints:
POST /api/auth/login          - Login user
POST /api/auth/register       - Register new user
POST /api/auth/logout         - Logout user
GET  /api/auth/me             - Get current user
PUT  /api/auth/profile        - Update profile
POST /api/auth/change-password - Change password
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password  - Reset password
POST /api/auth/verify-email    - Verify email
```

### 2. Listings API (`/api/listings`)

```typescript
interface Listing {
  id: number;
  title: string;
  price: number;
  location: string;
  year: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  engineSize: number;
  condition: string;
  seller: {
    name: string;
    verified: boolean;
    phone: string;
  };
  description: string;
  features: string[];
  images: string[];
  isFeatured?: boolean;
  featuredUntil?: string;
}

Endpoints:
GET    /api/listings              - Get all listings
GET    /api/listings/:id          - Get single listing
POST   /api/listings              - Create listing
PUT    /api/listings/:id          - Update listing
DELETE /api/listings/:id          - Delete listing
GET    /api/listings/search       - Search listings
POST   /api/listings/:id/feature  - Feature a listing
GET    /api/listings/featured     - Get featured listings
POST   /api/listings/:id/images   - Upload images
DELETE /api/listings/:id/images/:imageId - Delete image
```

### 3. Users API (`/api/users`)

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  listings?: Listing[];
  savedListings?: string[];
  stats?: {
    totalListings: number;
    activeSales: number;
    completedSales: number;
  };
}

Endpoints:
GET  /api/users/:id/profile           - Get user profile
PUT  /api/users/profile               - Update profile
POST /api/users/avatar                - Upload avatar
GET  /api/users/:id/listings          - Get user listings
GET  /api/users/saved-listings        - Get saved listings
POST /api/users/saved-listings/:id    - Save listing
DELETE /api/users/saved-listings/:id  - Unsave listing
PUT  /api/users/notification-preferences - Update notification preferences
GET  /api/users/notification-preferences - Get notification preferences
```

### 4. Messages API (`/api/messages`)

```typescript
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

Endpoints:
GET    /api/messages/conversations           - Get all conversations
GET    /api/messages/conversations/:id       - Get single conversation
GET    /api/messages/conversations/:id/messages - Get conversation messages
POST   /api/messages/conversations           - Start new conversation
POST   /api/messages/conversations/:id/messages - Send message
POST   /api/messages/conversations/:id/read   - Mark as read
DELETE /api/messages/conversations/:id        - Delete conversation
DELETE /api/messages/conversations/:id/messages/:messageId - Delete message
```

### 5. Payments API (`/api/payments`)

```typescript
interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'stripe' | 'easypaisa';
  metadata: {
    listingId?: string;
    featureDuration?: number;
  };
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  description: string;
}

Endpoints:
POST /api/payments/stripe/create-intent    - Create Stripe payment intent
POST /api/payments/stripe/webhook          - Stripe webhook
POST /api/payments/easypaisa/initiate     - Initiate Easypaisa payment
POST /api/payments/easypaisa/callback     - Easypaisa callback
GET  /api/payments/history                - Get payment history
GET  /api/payments/:id                    - Get payment details
GET  /api/payments/:id/receipt            - Get payment receipt
```

## Frontend State Management

### 1. Authentication State
- Managed through React Context
- JWT token stored in localStorage
- User data cached with React Query

### 2. Listings State
- Cached with React Query
- Infinite scroll pagination
- Real-time updates for featured status

### 3. Messages State
- WebSocket connection for real-time updates
- Message queue for offline support
- Optimistic updates

### 4. Search State
- URL-based search parameters
- Debounced search input
- Filter state preserved in URL

## File Upload

### Image Upload
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP
- Max images per listing: 10
- Client-side compression
- Progress tracking

### Avatar Upload
- Max file size: 2MB
- Square crop enforced
- Client-side preview

## Real-time Features

### WebSocket Events
```typescript
interface WebSocketEvent {
  type: 'message' | 'notification' | 'listing_update';
  payload: any;
}

// Message Event
interface MessageEvent {
  type: 'message';
  payload: {
    conversationId: string;
    message: Message;
  };
}

// Notification Event
interface NotificationEvent {
  type: 'notification';
  payload: {
    type: string;
    message: string;
    data?: any;
  };
}

// Listing Update Event
interface ListingUpdateEvent {
  type: 'listing_update';
  payload: {
    listingId: string;
    changes: Partial<Listing>;
  };
}
```

## Error Handling

### API Error Structure
```typescript
interface APIError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid login credentials
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: User lacks permission
- `RATE_LIMITED`: Too many requests

## Frontend Security

### CSRF Protection
- CSRF token included in headers
- Secure cookie handling

### Input Validation
- Client-side validation
- XSS prevention
- File type validation

### Authentication
- JWT token refresh
- Secure token storage
- Session management

## Required Backend Features

1. **Authentication**
   - JWT token generation and validation
   - Password hashing (bcrypt)
   - Email verification
   - Password reset flow

2. **File Storage**
   - Image upload handling
   - File type validation
   - Storage service integration
   - Image optimization

3. **Real-time**
   - WebSocket server
   - Message queuing
   - Presence tracking
   - Event broadcasting

4. **Search**
   - Full-text search
   - Geo-location search
   - Filter optimization
   - Search result caching

5. **Payments**
   - Stripe integration
   - Easypaisa integration
   - Payment webhook handling
   - Receipt generation

6. **Security**
   - Rate limiting
   - Input sanitization
   - CORS configuration
   - API authentication
   - Request validation
