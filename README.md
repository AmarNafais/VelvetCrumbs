# VelvetCrumbs E-Commerce Platform

A modern, full-stack e-commerce platform built with React, Express, MySQL, and TypeScript.

🌐 **Live Site**: www.velvetcrumbs.lk

## 🚀 Features

- **Product Management**: Full CRUD operations for products, categories, and collections
- **User Authentication**: Secure authentication with Passport.js and session management
- **Shopping Cart & Wishlist**: Real-time cart and wishlist functionality
- **Order Management**: Complete order processing and tracking system
- **Admin Dashboard**: Comprehensive admin panel for managing products, orders, and users
- **Reviews & Ratings**: Product review and rating system
- **Email Notifications**: Order confirmations and updates via SendGrid/Nodemailer
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Firebase Integration**: Firebase for additional features
- **Real-time Updates**: WebSocket support for live updates

## 📋 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- TanStack Query for data fetching
- Wouter for routing
- Framer Motion for animations

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- Drizzle ORM
- Passport.js for authentication
- Express Session for session management

### Infrastructure
- MySQL Database (Local or Cloud)
- Firebase (optional features)
- SendGrid/Nodemailer for emails

## � Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/VelvetCrumbs.git
cd VelvetCrumbs

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npm run db:push

# 5. Start development server
npm run dev

# Visit http://localhost:5000
```

## 🌐 How to Host on www.velvetcrumbs.lk

### Quick Hosting Steps:

**1. Get a Linux Server**
   - Providers: DigitalOcean, Linode, Vultr, AWS EC2
   - Choose: Ubuntu 20.04+, at least 2GB RAM
   - Cost: ~$6-12/month

**2. Point Your Domain**
   - Go to your domain registrar (where you bought velvetcrumbs.lk)
   - Add DNS A record: `www` → Your server IP address
   - Add DNS A record: `@` → Your server IP address
   - Wait 5-10 minutes for DNS to propagate

**3. Upload Your Code**
   - Use Git (recommended): `git clone` on server
   - Or use SCP/SFTP from Windows to server
   - Or zip and upload via file transfer

**4. Follow Deployment Steps Below**
   - The detailed guide below walks you through:
     - Installing required software
     - Configuring database and environment
     - Setting up HTTPS/SSL
     - Going live!

⏱️ **Total Time**: 30-45 minutes

---

## 🖥️ Production Hosting Guide (www.velvetcrumbs.lk)

This guide will walk you through deploying VelvetCrumbs to a Linux server with your custom domain.

### 📋 What You'll Need

Before starting, ensure you have:

1. **Server**: Linux VPS (Ubuntu 20.04+, DigitalOcean, Linode, AWS EC2, etc.)
2. **Domain**: www.velvetcrumbs.lk pointing to your server IP via DNS A record
3. **Access**: SSH access with root or sudo privileges
4. **Database**: MySQL (local on server or cloud service like PlanetScale, AWS RDS)

### 🎯 Hosting Overview

```
Your Computer → Upload Code → Linux Server → Nginx → Your App (Port 5000)
                                    ↓
                              SSL Certificate (HTTPS)
                                    ↓
                              www.velvetcrumbs.lk
```

### ✅ Deployment Checklist

Follow these steps in order:

- [ ] **Step 1**: Setup server (Node.js, MySQL, Nginx)
- [ ] **Step 2**: Upload your code to server
- [ ] **Step 3**: Install dependencies and configure environment
- [ ] **Step 4**: Build application
- [ ] **Step 5**: Configure Nginx reverse proxy
- [ ] **Step 6**: Setup SSL certificate (HTTPS)
- [ ] **Step 7**: Start application with PM2
- [ ] **Step 8**: Test and verify
- [ ] **Step 9**: Setup automatic backups
- [ ] **Step 10**: Configure monitoring

---

### Prerequisites

Before deploying to your Linux server, ensure you have:

- Ubuntu 20.04 LTS or newer (or similar Linux distribution)
- Root or sudo access
- Domain name (www.velvetcrumbs.lk) pointing to your server IP
- MySQL database (local or cloud-hosted)

### Step 1: Server Setup

#### 1.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2 Install Node.js (v20 LTS)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

#### 1.3 Install MySQL (if using local database)

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation

# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32)
echo "Your MySQL password: $DB_PASSWORD"

# Create database and user
sudo mysql -u root
```

Inside MySQL:
```sql
CREATE DATABASE velvetcrumbs;
CREATE USER 'velvetcrumbs_user'@'localhost' IDENTIFIED BY 'your_generated_password_here';
GRANT ALL PRIVILEGES ON velvetcrumbs.* TO 'velvetcrumbs_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**⚠️ IMPORTANT**: Save the password you created. You'll need it for the `.env` file.

#### 1.4 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 1.5 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 1.6 Install Git

```bash
sudo apt install -y git
```

#### 1.7 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 2: Application Setup

#### 2.1 Upload Your Code

Choose one method:

**Option A: Using Git (Recommended)**
```bash
cd ~
git clone https://github.com/yourusername/VelvetCrumbs.git
cd VelvetCrumbs
```

**Option B: Upload via SCP from your local machine**
```bash
# From your Windows machine (Git Bash or PowerShell)
scp -r C:/Users/nabee/Desktop/VelvetCrumbs root@your-server-ip:/root/
```

**Option C: Upload via FTP/SFTP**
- Use FileZilla or WinSCP
- Connect to your server as root
- Upload the entire VelvetCrumbs folder to `/root/`

#### 2.2 Install Dependencies

```bash
cd ~/VelvetCrumbs
npm install
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the application root directory:

```bash
nano .env
```

Add the following configuration (replace values with your actual settings):

```env
# Application
NODE_ENV=production
PORT=5000

# Database Configuration
# IMPORTANT: Never share or commit this file to version control!
# DATABASE_URL format: mysql://username:password@host:port/database

# Option 1: Local MySQL Server
DATABASE_URL=mysql://velvetcrumbs_user:your_mysql_password_here@localhost:3306/velvetcrumbs

# Option 2: Cloud MySQL (PlanetScale, AWS RDS, DigitalOcean, etc.)
# DATABASE_URL=mysql://username:password@your-db-host.region.provider.com:3306/velvetcrumbs

# Session Secret (generate with command below)
SESSION_SECRET=generate_a_very_long_random_string_at_least_32_characters_long

# Email Service (Optional - Choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=orders@velvetcrumbs.lk
ADMIN_EMAIL=admin@velvetcrumbs.lk

# Option 2: SMTP/Nodemailer (for Gmail or other SMTP services)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# Firebase (Optional - only if using Firebase features)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Domain Configuration
DOMAIN=www.velvetcrumbs.lk
```

**How to fill in DATABASE_URL:**

1. **Get your credentials:**
   - Username: `velvetcrumbs_user` (or whatever you created)
   - Password: The password you generated during MySQL setup
   - Host: `localhost` (for local) or cloud provider host
   - Database: `velvetcrumbs`

2. **Example DATABASE_URL:**
   ```env
   DATABASE_URL=mysql://velvetcrumbs_user:aB1cD2eF3gH4iJ5kL6mN7oP8@localhost:3306/velvetcrumbs
   ```

Save and exit (Ctrl+X, then Y, then Enter).

#### 2.4 Generate Secure Session Secret

```bash
# Generate a secure random string for SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `SESSION_SECRET` in your `.env` file.

#### 2.5 Initialize Database

```bash
# Push database schema
npm run db:push

# Optional: Seed admin user (if you have a seed script)
# npm run seed
```

### Step 3: Build and Start Application

#### 3.1 Build the Application

```bash
npm run build
```

This will:
- Build the React frontend to `dist/public`
- Bundle the Express backend to `dist/index.js`

#### 3.2 Test the Application

```bash
# Test the production build locally first
npm start

# In another terminal, test if it's running
curl http://localhost:5000
```

If successful, stop the server (Ctrl+C) and proceed to PM2 setup.

#### 3.3 Start with PM2

```bash
# Start the application with PM2
pm2 start npm --name "velvetcrumbs" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the instructions provided by the command above
```

#### 3.4 Monitor Application

```bash
# View application status
pm2 status

# View logs
pm2 logs velvetcrumbs

# Monitor in real-time
pm2 monit
```

### Step 4: Nginx Configuration

#### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/velvetcrumbs
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name www.velvetcrumbs.lk velvetcrumbs.lk;

    # Redirect to www
    if ($host = velvetcrumbs.lk) {
        return 301 https://www.velvetcrumbs.lk$request_uri;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Save and exit.

#### 4.2 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/velvetcrumbs /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: SSL Certificate (HTTPS)

#### 5.1 Obtain SSL Certificate

```bash
sudo certbot --nginx -d www.velvetcrumbs.lk -d velvetcrumbs.lk
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

#### 5.2 Verify SSL Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Certificates will auto-renew via cron/systemd timer
```

### Step 6: Firewall Configuration

#### 6.1 Setup UFW Firewall

```bash
# Install UFW if not present
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### Step 7: Database Backup Setup

#### 7.1 Create Backup Script

```bash
mkdir -p ~/backups
nano ~/backups/backup-db.sh
```

Add the following script:

```bash
#!/bin/bash
# VelvetCrumbs Database Backup Script

# Load environment variables from .env file
export $(grep -v '^#' ~/VelvetCrumbs/.env | xargs)

BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Extract database credentials from DATABASE_URL
# Format: mysql://username:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Create backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > "$BACKUP_DIR/velvetcrumbs_$DATE.sql"

# Remove backups older than 7 days
find $BACKUP_DIR -name "velvetcrumbs_*.sql" -mtime +7 -delete

echo "Backup completed: velvetcrumbs_$DATE.sql"
```

Make it executable:

```bash
chmod +x ~/backups/backup-db.sh
```

#### 7.2 Schedule Daily Backups

```bash
# Open crontab
crontab -e

# Add this line to run backup daily at 2 AM
0 2 * * * ~/backups/backup-db.sh >> ~/backups/backup.log 2>&1
```

### Step 8: Post-Deployment Tasks

#### 8.1 Create Admin User

Access your application at https://www.velvetcrumbs.lk and create an admin account, or run a seed script:

```bash
# If you have a seed-admin script
npm run seed-admin
```

#### 8.2 Test All Functionality

- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Checkout process
- [ ] Order placement
- [ ] Admin dashboard access
- [ ] Product management
- [ ] Order management
- [ ] Email notifications

#### 8.3 Monitor Application

```bash
# View application logs
pm2 logs velvetcrumbs

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Step 9: Deployment Updates

When you need to deploy updates:

```bash
# 1. Pull latest changes
cd ~/VelvetCrumbs
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Run database migrations if needed
npm run db:push

# 4. Rebuild the application
npm run build

# 5. Restart with PM2
pm2 restart velvetcrumbs

# 6. Check logs for errors
pm2 logs velvetcrumbs --lines 50
```

### Step 10: Monitoring and Maintenance

#### 10.1 Setup PM2 Monitoring

```bash
# Install PM2 logrotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### 10.2 System Monitoring

```bash
# Install htop for monitoring
sudo apt install -y htop

# Monitor system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

#### 10.3 Application Health Check

Create a health check script:

```bash
nano ~/health-check.sh
```

Add:

```bash
#!/bin/bash
# Health check for VelvetCrumbs

URL="https://www.velvetcrumbs.lk"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -eq 200 ]; then
    echo "$(date): Application is healthy (HTTP $STATUS)"
else
    echo "$(date): Application is down (HTTP $STATUS)"
    # Restart application
    pm2 restart velvetcrumbs
    echo "$(date): Application restarted"
fi
```

Make executable and schedule:

```bash
chmod +x ~/health-check.sh

# Add to crontab to run every 5 minutes
crontab -e
# Add: */5 * * * * /home/velvetcrumbs/health-check.sh >> /home/velvetcrumbs/health-check.log 2>&1
```

## 🔒 Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use Strong Passwords**
   - Database passwords should be at least 16 characters
   - Use a password manager

3. **Firewall Rules**
   - Only open necessary ports (22, 80, 443)
   - Restrict SSH access by IP if possible

4. **Regular Backups**
   - Daily automated database backups
   - Weekly full system backups
   - Store backups off-site

5. **Monitor Logs**
   - Regularly check application and system logs
   - Set up alerts for errors

6. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong session secrets
   - Rotate secrets periodically

7. **Rate Limiting**
   - Consider implementing rate limiting for API endpoints
   - Use fail2ban to prevent brute force attacks

8. **Database Security**
   - Use SSL connections to database
   - Restrict database access by IP
   - Regular security updates

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs velvetcrumbs

# Check environment variables
pm2 env velvetcrumbs

# Restart application
pm2 restart velvetcrumbs
```

### Database Connection Issues

```bash
# Test database connection
mysql -u velvetcrumbs_user -p velvetcrumbs

# Check if MySQL is running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

### Nginx Issues

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check renewal logs
sudo cat /var/log/letsencrypt/letsencrypt.log
```

### High Memory Usage

```bash
# Check memory usage
free -h
htop

# Restart application
pm2 restart velvetcrumbs

# Clear cache if needed
pm2 flush
```

## 📚 Development

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/VelvetCrumbs.git
cd VelvetCrumbs

# Install dependencies
npm install

# Create .env file with development settings
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
VelvetCrumbs/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Entry point
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Authentication
│   ├── db.ts               # Database connection
│   └── storage.ts          # File storage
├── shared/                 # Shared code
│   └── schema.ts           # Database schema
├── migrations/             # Database migrations
└── dist/                   # Build output
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@velvetcrumbs.lk or open an issue in the repository.

## 🙏 Acknowledgments

- React and Vite teams for amazing development tools
- Radix UI for accessible component primitives
- Drizzle ORM for type-safe database queries
- All contributors and users of VelvetCrumbs

---

**VelvetCrumbs** - Your Premium E-Commerce Solution

Built with ❤️ using modern web technologies
