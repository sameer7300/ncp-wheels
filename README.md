# NCP Wheels - Vehicle Marketplace

A modern vehicle marketplace application built with React and Django.

## Features

### Completed
- Modern UI with styled-components
- User Authentication
  - Email/Password login
  - Social login (Google, Facebook)
  - Protected routes
- User Profile Management
  - Profile information editing
  - Avatar upload
  - Form validation

### Coming Soon
- Vehicle Listings
- Search and Filtering
- Messaging System
- Favorites/Watchlist
- User Reviews
- Analytics Dashboard

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Styled Components
- React Query
- React Router DOM
- React Hook Form
- Zod

### Backend (In Progress)
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Celery
- Redis
- AWS S3/Cloudinary

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ncp-wheelsv2.git
cd ncp-wheelsv2
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # Basic UI components
│   │   └── layout/    # Layout components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities and API clients
│   ├── pages/         # Page components
│   └── styles/        # Global styles and theme
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
