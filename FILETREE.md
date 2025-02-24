# NCP Wheels Project Structure

```
ncp-wheelsv2/
├── frontend/                   # Frontend React Application
│   ├── public/                # Static files
│   │   ├── assets/           # Images, fonts, etc.
│   │   └── index.html        # HTML entry point
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── browse/      # Browsing and search components
│   │   │   ├── common/      # Common UI components
│   │   │   ├── listings/    # Listing related components
│   │   │   ├── messages/    # Messaging components
│   │   │   ├── payments/    # Payment components
│   │   │   └── profile/     # Profile components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Auth pages
│   │   │   ├── home/        # Home page
│   │   │   ├── listings/    # Listing pages
│   │   │   ├── messages/    # Message pages
│   │   │   ├── payments/    # Payment pages
│   │   │   └── profile/     # Profile pages
│   │   ├── services/        # API and service integrations
│   │   │   ├── api/        # API clients
│   │   │   └── socket/     # WebSocket handlers
│   │   ├── store/          # State management
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Root component
│   │   ├── config.ts       # App configuration
│   │   └── main.tsx        # Entry point
│   ├── .env.example        # Example environment variables
│   ├── package.json        # Dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite configuration
│
├── backend/                    # Backend Express/Node.js Application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── app.ts           # App entry point
│   ├── tests/               # Test files
│   ├── .env.example         # Example environment variables
│   ├── package.json         # Dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── shared/                     # Shared code between frontend and backend
│   ├── types/                # Shared TypeScript types
│   ├── constants/            # Shared constants
│   └── utils/               # Shared utilities
│
├── docs/                       # Documentation
│   ├── api/                  # API documentation
│   ├── deployment/           # Deployment guides
│   └── development/          # Development guides
│
├── scripts/                    # Build and deployment scripts
├── .gitignore                 # Git ignore file
├── .eslintrc                  # ESLint configuration
├── .prettierrc               # Prettier configuration
├── docker-compose.yml         # Docker compose configuration
├── FILETREE.md               # This file
├── README.md                 # Project overview
├── USERFLOW.md               # User flow documentation
└── package.json              # Root package.json for workspaces
```

## Key Directories and Files Explained

### Frontend

- `components/`: Reusable UI components organized by feature
- `pages/`: Full page components that compose smaller components
- `services/`: API clients and external service integrations
- `hooks/`: Custom React hooks for shared logic
- `store/`: State management (React Query, Context)
- `utils/`: Helper functions and utilities
- `types/`: TypeScript type definitions

### Backend

- `controllers/`: Request handlers for each API endpoint
- `models/`: Database models and schemas
- `routes/`: API route definitions
- `services/`: Business logic and external service integrations
- `middleware/`: Custom Express middleware
- `utils/`: Helper functions and utilities

### Shared

- `types/`: Shared TypeScript interfaces
- `constants/`: Shared constant values
- `utils/`: Shared utility functions

### Documentation

- `api/`: API documentation and schemas
- `deployment/`: Deployment and infrastructure guides
- `development/`: Development setup and guidelines

## File Naming Conventions

1. React Components: PascalCase (e.g., `ListingCard.tsx`)
2. Utilities: camelCase (e.g., `formatPrice.ts`)
3. Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
4. Types/Interfaces: PascalCase with type prefix (e.g., `IUser.ts`, `TListing.ts`)
5. Test files: Same name as tested file with `.test` suffix

## Module Organization

Each feature module (e.g., listings, auth) follows a similar structure:
```
feature/
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── types/          # Feature-specific types
├── utils/          # Feature-specific utilities
└── index.ts        # Public API of the feature
```
