# DigitalOcean Deployment Checklist

## Before Deployment

### 1. Environment Configuration
- [ ] Update `.env` file with production database URL
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT` if needed (default: 5000)
- [ ] Configure `PGSSLMODE=require` for secure database connections
- [ ] Generate a secure `SESSION_SECRET` (minimum 32 characters)

### 2. Database Setup
- [ ] Create PostgreSQL database on DigitalOcean
- [ ] Update `DATABASE_URL` in .env file
- [ ] Run database migrations: `npm run db:push`
- [ ] Verify database connection

### 3. Build and Start
- [ ] Install dependencies: `npm install`
- [ ] Build the application: `npm run build`
- [ ] Start production server: `npm start`

### 4. Security Considerations
- [ ] Never commit `.env` file to version control
- [ ] Use strong passwords for database
- [ ] Configure SSL/TLS properly
- [ ] Set up proper firewall rules

## Production Environment Variables

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your_secure_session_secret_here
NODE_ENV=production
PORT=5000

# SSL Configuration
NODE_TLS_REJECT_UNAUTHORIZED=0
PGSSLMODE=require

# Optional (for email functionality)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=orders@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Deployment Commands

```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

## Post-Deployment Verification
- [ ] Check server logs for errors
- [ ] Test API endpoints
- [ ] Verify database connectivity
- [ ] Test user authentication
- [ ] Test product catalog loading
- [ ] Test cart functionality
- [ ] Test order placement

## Troubleshooting
- Check server logs: `journalctl -u your-service-name -f`
- Verify environment variables are loaded
- Check database connectivity
- Ensure proper SSL configuration
- Verify port accessibility