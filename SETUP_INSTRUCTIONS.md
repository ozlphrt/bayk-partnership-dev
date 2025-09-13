# SailClub Partnership Management System - Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

### 1. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `sailclub_db`
3. Update the `DATABASE_URL` in `backend/env.local`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/sailclub_db"
   ```

#### Option B: Docker (Recommended)
1. Install Docker Desktop
2. Run: `docker compose up -d` (starts PostgreSQL automatically)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
copy env.local .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with demo data
npm run prisma:seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
copy env.local .env.local

# Start the frontend development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database Studio**: `npx prisma studio` (run from backend directory)

## 🔐 Demo Credentials

### Member Account
- **Email**: `member@sailclub.com`
- **Password**: `password123`

### Partner Account
- **Email**: `partner@sailclub.com`
- **Password**: `password123`

### Admin Account
- **Email**: `admin@sailclub.com`
- **Password**: `password123`

## 📱 Features Overview

### Member Features
- ✅ View membership profile and QR code
- ✅ Browse partner directory
- ✅ View usage history and savings
- ✅ Download/share QR code
- ✅ Real-time partner updates

### Partner Features
- ✅ Business profile management
- ✅ QR code scanner for member verification
- ✅ Discount application system
- ✅ Transaction tracking and analytics
- ✅ Partnership agreement management

### Admin Features
- ✅ System-wide analytics and statistics
- ✅ Member and partner management
- ✅ Partnership agreement creation
- ✅ Transaction monitoring
- ✅ User role management

## 🛠️ Development Commands

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linter
npm run prisma:studio # Open database studio
npm run prisma:reset  # Reset database and reseed
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run type-check   # Run TypeScript checks
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sailclub_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
QR_CODE_SECRET="your-qr-code-secret-key"
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SailClub Partnership Management
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Update VITE_API_URL in frontend/.env.local

3. **CORS Errors**
   - Ensure CORS_ORIGIN matches frontend URL
   - Check backend is running on correct port

4. **Prisma Errors**
   - Run `npx prisma generate`
   - Check database connection
   - Verify schema.prisma syntax

### Reset Everything
```bash
# Backend
cd backend
npm run prisma:reset
npm run dev

# Frontend
cd frontend
npm run dev
```

## 📊 Database Schema

The system includes the following main entities:
- **Users**: Authentication and basic info
- **Members**: Sailing club members with QR codes
- **Partners**: Business partners with agreements
- **Admins**: System administrators
- **Partnerships**: Agreements between club and partners
- **Discounts**: Individual discount records
- **Transactions**: Usage tracking and analytics
- **UsageLogs**: Detailed member activity logs
- **Promotions**: Special offers and campaigns

## 🚀 Production Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Use strong JWT secrets
3. Configure production database
4. Set up SSL/HTTPS
5. Configure reverse proxy (nginx)

### Frontend Deployment
1. Build: `npm run build`
2. Deploy dist/ folder to web server
3. Configure environment variables
4. Set up SSL/HTTPS

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs in browser console
3. Check backend server logs
4. Verify database connectivity

## 🎯 Next Steps

After setup:
1. Test all user roles and features
2. Customize business logic as needed
3. Add additional partners and agreements
4. Configure email notifications
5. Set up monitoring and logging
6. Plan production deployment

---

**Happy Sailing! ⛵**
