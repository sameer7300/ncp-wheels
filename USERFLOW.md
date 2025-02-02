# NCP Wheels V2 - User Flow Documentation

## 1. User Registration and Authentication

### Guest User
```mermaid
graph TD
    A[Landing Page] --> B{Has Account?}
    B -->|No| C[Sign Up]
    B -->|Yes| D[Login]
    C --> E[Fill Registration Form]
    E --> F[Email Verification]
    F --> G[Complete Profile]
    D --> H[Dashboard]
    G --> H
```

### Authentication Flow
1. User visits website
2. Chooses to register or login
3. Completes required steps
4. Redirected to dashboard

## 2. Car Listing Management

### Seller Flow
```mermaid
graph TD
    A[Dashboard] --> B[Create Listing]
    B --> C[Add Car Details]
    C --> D[Upload Images]
    D --> E[Set Price]
    E --> F[Preview]
    F -->|Edit| C
    F -->|Publish| G[Live Listing]
```

### Buyer Flow
```mermaid
graph TD
    A[Browse Cars] --> B[Search/Filter]
    B --> C[View Listing]
    C --> D{Interested?}
    D -->|Yes| E[Contact Seller]
    D -->|Maybe| F[Save/Favorite]
    E --> G[Chat/Message]
```

## 3. Search and Discovery

### Search Flow
1. Enter search criteria
2. Apply filters
   - Price range
   - Make/Model
   - Year
   - Location
3. View results
4. Refine search

### Advanced Features
- Save searches
- Set alerts
- Compare cars
- View history

## 4. Communication

### Messaging Flow
```mermaid
graph TD
    A[View Listing] --> B[Contact Seller]
    B --> C[Send Message]
    C --> D[Chat Thread]
    D --> E[Arrange Viewing]
```

## 5. Transaction Process

### Buying Process
1. Find car
2. Contact seller
3. Negotiate price
4. Arrange inspection
5. Complete purchase

### Selling Process
1. Create listing
2. Respond to inquiries
3. Show car
4. Negotiate
5. Complete sale

## 6. Premium Features

### Premium User Flow
```mermaid
graph TD
    A[Regular User] --> B[View Premium Features]
    B --> C[Choose Plan]
    C --> D[Payment]
    D --> E[Access Premium]
```

## 7. Admin Operations

### Moderation Flow
```mermaid
graph TD
    A[New Content] --> B[Auto Check]
    B --> C{Flagged?}
    C -->|Yes| D[Manual Review]
    C -->|No| E[Approved]
    D -->|Approve| E
    D -->|Reject| F[Notify User]
```
