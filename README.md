# SailClub Partnership Management System

A comprehensive web application for managing partnerships between a sailing club and various businesses that provide exclusive discounts to club members.

## 🚀 Features

### For Members
- **Digital Membership Card**: QR code-based verification for instant partner discount access
- **Partner Directory**: Browse all available partners with location, services, and current discounts
- **Real-time Updates**: View new partners and promotional offers as they become available
- **Membership Status**: Check membership dues and account status
- **Usage Tracking**: View personal discount usage history

### For Partner Businesses
- **Member Verification**: Scan QR codes to verify membership and apply appropriate discounts
- **Usage Analytics**: Track member visits, discount applications, and business impact
- **Promotion Management**: Create and manage special offers for club members
- **Performance Dashboard**: View partnership metrics and member engagement

### For Club Administrators
- **Partner Management**: Onboard new partners, manage agreements, and set discount rates
- **Member Management**: Handle membership applications, dues tracking, and member status
- **Analytics & Reporting**: Comprehensive tracking of partnership performance and member engagement
- **Content Management**: Manage partner listings, promotions, and system-wide announcements

## 🛠️ Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Material-UI (MUI)** for consistent design system
- **Redux Toolkit** for state management
- **React Router** for navigation
- **QR Code** generation and scanning
- **Chart.js** for analytics visualization
- **Vite** for fast development and building

### Backend
- **Node.js 18+** with TypeScript
- **Express.js** with comprehensive middleware
- **PostgreSQL** with Prisma ORM
- **JWT** authentication with refresh tokens
- **Socket.io** for real-time updates
- **Winston** for structured logging
- **QR Code** generation and verification

### DevOps
- **Docker** containerization
- **Docker Compose** for local development
- **PostgreSQL** database
- **Redis** for caching (optional)

## 📋 Prerequisites

- Node.js 18.0.0+
- npm 8.0.0+
- PostgreSQL 14.0+
- Git 2.30.0+
- Docker 20.10.0+ (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sailclub-partnership
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs

### Option 2: Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd sailclub-partnership
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sailclub_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_WS_URL="ws://localhost:5000"
VITE_APP_NAME="SailClub Partnership"
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Base user model for all user types
- **Member**: Member-specific profile and membership details
- **Partner**: Partner business information and agreements
- **Admin**: Administrative user profiles
- **PartnershipAgreement**: Discount terms and conditions
- **Transaction**: Discount applications and usage tracking
- **UsageHistory**: Member discount usage records

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for members, partners, and admins
- **Encrypted QR Codes**: Tamper-proof member verification
- **Input Validation**: Comprehensive data validation and sanitization
- **Rate Limiting**: API protection against abuse
- **HTTPS Enforcement**: Secure communication in production

## 📱 User Roles

### Member
- Access partner directory and discounts
- Digital membership verification via QR code
- Personal account management and usage tracking

### Partner
- Member verification and discount application
- Business analytics and performance tracking
- Promotion creation and management

### Admin
- Full system management and oversight
- Partner onboarding and agreement management
- Member administration and system analytics

## 🎨 Design System

- **Dark Theme Only**: Consistent dark theme across all interfaces
- **Glass Panels**: Semi-transparent, blurred, rounded panels (≥12px radius)
- **Hover-drag Numerics**: Primary adjustment method (no sliders)
- **Smooth Transitions**: 200–300ms transitions with auto-hide side panels
- **Performance Targets**: 60fps normal load, never below 30fps

## 📈 Performance Targets

- **Frontend**: 60fps normal load, <512MB memory, <2ms input lag
- **Backend**: <200ms API response, 1000+ concurrent users
- **QR Code**: <100ms generation, <50ms verification
- **Database**: <100ms average query time

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] International expansion
- [ ] API for third-party integrations
- [ ] Advanced reporting features

---

**Built with ❤️ for the sailing community**
