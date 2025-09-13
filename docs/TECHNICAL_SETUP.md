# SailClub Partnership Management - Technical Setup

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5 for consistent design system
- **State Management**: Redux Toolkit with RTK Query for API management
- **Routing**: React Router v6
- **QR Code**: qrcode.js for generation, qr-scanner for reading
- **Charts/Analytics**: Chart.js with react-chartjs-2
- **Build Tool**: Vite for fast development and building
- **Styling**: CSS Modules + MUI theming (dark theme only)

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with Express-validator
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT with refresh tokens + bcrypt for password hashing
- **File Storage**: AWS S3 or local storage for QR codes and images
- **API Documentation**: Swagger/OpenAPI 3.0
- **Real-time**: Socket.io for live updates
- **Email**: Nodemailer with SMTP
- **QR Code**: qrcode library for server-side generation

### Database
- **Primary**: PostgreSQL 14+
- **ORM**: Prisma for type-safe database operations
- **Migrations**: Prisma migrations for schema management
- **Backup**: Automated daily backups with pg_dump
- **Connection Pooling**: pg-pool for connection management

### DevOps & Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Production**: AWS EC2 or DigitalOcean Droplet
- **Reverse Proxy**: Nginx for production
- **SSL**: Let's Encrypt for HTTPS
- **Monitoring**: PM2 for process management
- **Logging**: Winston for structured logging

## Development Environment Setup

### Prerequisites
```bash
# Required software versions
Node.js: 18.0.0+
npm: 8.0.0+
PostgreSQL: 14.0+
Git: 2.30.0+
Docker: 20.10.0+ (optional)
```

### Project Structure
```
sailclub-partnership/
├── docs/                          # Documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── TASK_LIST.md
│   ├── TECHNICAL_SETUP.md
│   └── COMPLETION_REPORTS.md
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Redux store and slices
│   │   ├── services/            # API services
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── styles/              # Global styles and themes
│   ├── public/                  # Static assets
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js API server
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Database models (Prisma)
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   └── types/               # TypeScript types
│   ├── prisma/                  # Database schema and migrations
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml           # Local development setup
├── Dockerfile                   # Production container
└── README.md
```

### Installation Commands

#### 1. Clone and Setup
```bash
# Clone repository
git clone <repository-url>
cd sailclub-partnership

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. Database Setup
```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run database migrations
cd backend
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

#### 3. Environment Configuration
```bash
# Backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment variables
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sailclub_db"
DIRECT_URL="postgresql://username:password@localhost:5432/sailclub_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="sailclub-storage"
AWS_REGION="us-east-1"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# QR Code
QR_CODE_SECRET="your-qr-code-encryption-key"
```

#### Frontend (.env)
```env
# API
VITE_API_URL="http://localhost:5000/api"
VITE_WS_URL="ws://localhost:5000"

# App Configuration
VITE_APP_NAME="SailClub Partnership"
VITE_APP_VERSION="1.0.0"
```

## Development Workflow

### Local Development
```bash
# Start database
docker-compose up -d postgres

# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev

# Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# API Docs: http://localhost:5000/api-docs
```

### Database Management
```bash
# View database in Prisma Studio
cd backend
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration-name
```

### Code Quality Tools
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testing
npm run test

# Build for production
npm run build
```

## Performance Targets

### Frontend Performance
- **Initial Load**: < 3 seconds
- **FPS**: 60fps normal load, never below 30fps
- **Memory Usage**: < 512MB
- **Input Lag**: < 2ms
- **Bundle Size**: < 1MB gzipped

### Backend Performance
- **API Response Time**: < 200ms average
- **Database Queries**: < 100ms average
- **Concurrent Users**: 1000+ simultaneous
- **Uptime**: 99.9% availability

### QR Code Performance
- **Generation Time**: < 100ms
- **Verification Time**: < 50ms
- **Security**: Tamper-proof with encryption
- **Refresh Rate**: Configurable (default 24 hours)

## Security Implementation

### Authentication & Authorization
- JWT tokens with short expiration (15 minutes)
- Refresh tokens for seamless re-authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on authentication endpoints

### Data Protection
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- XSS protection with Content Security Policy
- CORS configuration for API access

### QR Code Security
- Encrypted QR codes with timestamp validation
- Tamper-proof verification system
- Automatic expiration and regeneration
- Audit trail for all verification attempts

## Monitoring & Logging

### Application Monitoring
- **Error Tracking**: Winston with structured logging
- **Performance Monitoring**: Custom metrics collection
- **User Analytics**: Privacy-compliant usage tracking
- **System Health**: Health check endpoints

### Database Monitoring
- **Query Performance**: Slow query logging
- **Connection Pool**: Connection monitoring
- **Backup Status**: Automated backup verification
- **Disk Usage**: Storage monitoring

## Deployment Strategy

### Development
- Local development with Docker Compose
- Hot reloading for both frontend and backend
- Database seeding for test data
- Mock services for external integrations

### Staging
- Production-like environment
- Automated testing pipeline
- Performance testing
- Security scanning

### Production
- Containerized deployment with Docker
- Load balancing with Nginx
- SSL termination
- Automated backups
- Monitoring and alerting

## API Design

### RESTful Endpoints
```
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout

# Members
GET /api/members
GET /api/members/:id
PUT /api/members/:id
GET /api/members/:id/qr-code
GET /api/members/:id/usage-history

# Partners
GET /api/partners
POST /api/partners
GET /api/partners/:id
PUT /api/partners/:id
POST /api/partners/:id/verify-member
GET /api/partners/:id/analytics

# Admin
GET /api/admin/dashboard
GET /api/admin/analytics
POST /api/admin/partners
PUT /api/admin/partners/:id
GET /api/admin/members
PUT /api/admin/members/:id
```

### WebSocket Events
```javascript
// Real-time updates
'member-verified'     // When member is verified at partner
'new-partner'         // When new partner is added
'promotion-updated'   // When promotion is updated
'system-announcement' // System-wide announcements
```

## Testing Strategy

### Unit Testing
- Jest for JavaScript/TypeScript testing
- React Testing Library for component testing
- Supertest for API endpoint testing
- Coverage target: 80%+

### Integration Testing
- Database integration tests
- API integration tests
- QR code system testing
- Authentication flow testing

### End-to-End Testing
- Playwright for browser automation
- User journey testing
- Cross-browser compatibility
- Mobile device testing

## Maintenance & Updates

### Regular Maintenance
- Weekly dependency updates
- Monthly security patches
- Quarterly performance reviews
- Annual architecture reviews

### Backup Strategy
- Daily automated database backups
- Weekly full system backups
- Monthly backup restoration testing
- Offsite backup storage

### Update Procedures
- Staged deployment process
- Rollback procedures
- Database migration testing
- User communication protocols
