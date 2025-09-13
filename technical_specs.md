# Technical Specifications - Sailing Club Partnership App

**Last Updated**: September 13, 2025  
**Version**: MVP 1.0  
**Platform**: Mobile-Friendly Web Application  

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Member App    │    │   Partner App   │    │   Admin Panel   │
│  (Frontend)     │    │   (Frontend)    │    │   (Frontend)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │   (Node.js)     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (SQLite/MVP)  │
                    └─────────────────┘
```

## Frontend Specifications

### Technology Stack
- **Framework**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid/Flexbox for responsive design
- **QR Code**: HTML5 Camera API + QR.js library
- **Charts**: Chart.js for analytics dashboards
- **PWA Features**: Service worker for offline capability

### Responsive Design Requirements
- **Mobile First**: 320px minimum width
- **Breakpoints**: 
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px  
  - Desktop: 1024px+
- **Touch Friendly**: Minimum 44px touch targets
- **Fast Loading**: <3 seconds on 3G connection

### UI/UX Specifications

#### Color Scheme
- **Primary**: #1e40af (Sailing Blue)
- **Secondary**: #059669 (Ocean Green)
- **Accent**: #dc2626 (Alert Red)
- **Neutral**: #6b7280 (Gray)
- **Background**: #f9fafb (Light Gray)

#### Typography
- **Headers**: Inter, sans-serif (Bold)
- **Body**: Inter, sans-serif (Regular)
- **Code/Data**: Monaco, monospace

## Backend Specifications

### API Architecture
- **Framework**: Node.js with Express.js (MVP can be simplified to static JSON)
- **Authentication**: JWT tokens (simplified for demo)
- **Validation**: Basic client-side validation
- **Rate Limiting**: Basic throttling
- **CORS**: Open for demo purposes

### Database Schema (JSON files for MVP demo)

#### users.json
```json
{
  "members": [
    {
      "id": "m001",
      "name": "John Marina",
      "email": "john@sailclub.com",
      "membership_number": "SC2024001",
      "total_savings": 450.75,
      "active": true
    }
  ],
  "partners": [
    {
      "id": "p001",
      "business_name": "Waterfront Bistro",
      "category": "restaurant",
      "contact_email": "manager@waterfrontbistro.com",
      "active": true
    }
  ]
}
```

#### offers.json
```json
{
  "offers": [
    {
      "id": "o001",
      "partner_id": "p001",
      "title": "15% off all meals",
      "description": "Valid for lunch and dinner",
      "discount_type": "percentage",
      "discount_value": 15,
      "category": "restaurant",
      "valid_until": "2025-12-31",
      "terms": "Cannot be combined with other offers"
    }
  ]
}
```

#### transactions.json
```json
{
  "transactions": [
    {
      "id": "t001",
      "member_id": "m001",
      "partner_id": "p001",
      "offer_id": "o001",
      "original_amount": 45.00,
      "discount_amount": 6.75,
      "final_amount": 38.25,
      "timestamp": "2025-09-13T18:30:00Z",
      "qr_token": "qr_12345_expired"
    }
  ]
}
```

## QR Code System

### Dynamic QR Code Generation
```javascript
// QR Code Structure
{
  "token": "unique_token_12345",
  "member_id": "m001",
  "offer_id": "o001",
  "timestamp": "2025-09-13T14:30:59Z",
  "expires_at": "2025-09-13T14:35:59Z"
}
```

### QR Code Lifecycle
1. **Generation**: Member selects offer → system generates unique token
2. **Display**: QR code shown to member with 5-minute expiry
3. **Scanning**: Partner scans code → system validates token
4. **Validation**: Check token validity, expiry, and single-use status
5. **Processing**: Apply discount and log transaction
6. **Expiry**: Token becomes invalid after use or timeout

### Security Features
- **Time-based expiration**: 5-minute window
- **Single-use tokens**: Cannot be reused after redemption
- **Unique generation**: Cryptographically secure random tokens
- **Validation required**: Backend verification for all transactions

## API Endpoints

### Member Endpoints
```
GET    /api/offers              // Get available offers
POST   /api/qr/generate         // Generate QR code for offer
GET    /api/member/savings      // Get member savings data
```

### Partner Endpoints
```
POST   /api/qr/validate         // Validate QR code
POST   /api/transaction         // Process transaction
GET    /api/partner/analytics   // Get partner analytics
```

### Admin Endpoints
```
GET    /api/admin/dashboard     // Get platform analytics
GET    /api/admin/partners      // Get all partners
GET    /api/admin/members       // Get all members
```

## File Structure

### Project Organization
```
sailing-club-app/
├── index.html                  // Landing page
├── member/
│   ├── index.html             // Member dashboard
│   ├── offers.html            // Browse offers
│   ├── qr-code.html          // QR code display
│   └── savings.html          // Savings tracking
├── partner/
│   ├── index.html            // Partner dashboard
│   ├── scanner.html          // QR code scanner
│   └── analytics.html        // Partner analytics
├── admin/
│   ├── index.html            // Admin dashboard
│   └── analytics.html        // Platform analytics
├── assets/
│   ├── css/
│   │   └── styles.css        // Main stylesheet
│   ├── js/
│   │   ├── qr-scanner.js     // QR scanning logic
│   │   ├── chart.min.js      // Charts library
│   │   └── app.js            // Main application logic
│   └── data/
│       ├── users.json        // User data
│       ├── offers.json       // Offers data
│       └── transactions.json // Transaction data
└── README.md                 // Setup instructions
```

## Security Considerations

### MVP Security Measures
- HTTPS enforcement
- Input validation on all forms
- XSS prevention through content sanitization
- CSRF protection for state-changing operations
- Secure QR token generation

### Production Security Requirements
- Database encryption at rest
- API rate limiting
- Advanced fraud detection
- Audit logging
- PCI compliance for payment processing

## Performance Requirements

### Load Times
- **Initial Page Load**: < 2 seconds
- **QR Code Generation**: < 500ms
- **QR Code Validation**: < 1 second
- **Analytics Loading**: < 3 seconds

### Scalability Targets
- **Concurrent Users**: 100 (MVP), 10,000 (Production)
- **Transactions per Second**: 10 (MVP), 1,000 (Production)
- **Data Storage**: 1GB (MVP), 1TB (Production)

## Browser Compatibility

### Supported Browsers
- **Chrome**: Version 90+
- **Safari**: Version 14+
- **Firefox**: Version 88+
- **Edge**: Version 90+

### Required Features
- HTML5 Camera API
- Local Storage
- Service Workers (optional for MVP)
- ES6 JavaScript support

## Deployment Specifications

### MVP Deployment
- **Platform**: GitHub Pages or Netlify
- **Domain**: Custom domain for professional presentation
- **SSL**: Automatic HTTPS
- **CDN**: Built-in content delivery

### Production Deployment
- **Server**: AWS EC2 or DigitalOcean Droplet
- **Database**: PostgreSQL or MongoDB
- **CDN**: CloudFlare for global distribution
- **Monitoring**: Application performance monitoring