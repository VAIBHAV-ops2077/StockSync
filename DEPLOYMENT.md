# 🚀 StockSync Deployment Guide

This guide covers various deployment options for the StockSync inventory management system.

## 📋 Pre-deployment Checklist

### Environment Variables Setup

1. **Backend Environment Variables** (create `backend/.env`):
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Frontend Environment Variables** (create `StockSync/.env`):
```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

## 🌐 Deployment Options

### Option 1: Railway + Netlify (Recommended)

#### Backend Deployment (Railway)
1. Create account at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create a new project and select your repository
4. Set environment variables in Railway dashboard
5. Deploy automatically on push to main branch

#### Frontend Deployment (Netlify)
1. Create account at [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - **Build command**: `cd StockSync && npm run build`
   - **Publish directory**: `StockSync/dist`
4. Set environment variables in Netlify dashboard
5. Deploy automatically on push to main branch

### Option 2: Heroku (Full-stack)

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create stocksync-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git subtree push --prefix backend heroku main
```

#### Frontend Deployment
```bash
# Create frontend app
heroku create stocksync-frontend

# Set buildpack
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static

# Create static.json in StockSync directory
echo '{"root": "dist/"}' > StockSync/static.json

# Deploy
git subtree push --prefix StockSync heroku main
```

### Option 3: Digital Ocean App Platform

1. Create account at [Digital Ocean](https://digitalocean.com)
2. Go to App Platform
3. Connect GitHub repository
4. Configure components:
   - **Backend**: Node.js service from `/backend` folder
   - **Frontend**: Static site from `/StockSync` folder
5. Set environment variables
6. Deploy

### Option 4: AWS (EC2 + S3)

#### Backend (EC2)
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb

# Clone and setup
git clone https://github.com/yourusername/stocksync.git
cd stocksync/backend
npm install
npm start
```

#### Frontend (S3 + CloudFront)
```bash
# Build frontend
cd StockSync
npm run build

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Option 5: Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Clone repository
git clone https://github.com/yourusername/stocksync.git
cd stocksync

# Update environment variables in docker-compose.yml
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Individual Docker Containers
```bash
# Build and run backend
docker build -f Dockerfile.backend -t stocksync-backend .
docker run -d -p 3001:3001 --env-file backend/.env stocksync-backend

# Build and run frontend
docker build -f Dockerfile.frontend -t stocksync-frontend .
docker run -d -p 3000:80 stocksync-frontend
```

### Option 6: Vercel + MongoDB Atlas

#### Frontend (Vercel)
1. Import repository to [Vercel](https://vercel.com)
2. Set framework preset to "Vite"
3. Set root directory to `StockSync`
4. Add environment variables
5. Deploy

#### Backend (Vercel Functions)
1. Create `api` folder in root
2. Move backend routes to serverless functions
3. Deploy with Vercel

## 🗄️ Database Options

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string
4. Add to environment variables

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use local connection string
MONGODB_URI=mongodb://localhost:27017/stocksync
```

## 🔧 CI/CD Setup

### GitHub Actions (Already configured)
- Automated testing on PR
- Automatic deployment on main branch push
- See `.github/workflows/deploy.yml`

### Custom CI/CD Pipeline
```bash
# Install dependencies
npm run install:all

# Run tests
npm run test

# Build frontend
npm run build

# Deploy backend
npm run deploy:backend

# Deploy frontend  
npm run deploy:frontend
```

## 🌍 Domain Configuration

### Custom Domain Setup
1. **Backend**: Update CORS settings with your domain
2. **Frontend**: Update API base URL
3. **DNS**: Point domain to deployment platform

### SSL Certificate
- Most platforms (Netlify, Vercel, Railway) provide free SSL
- For custom deployments, use Let's Encrypt

## 📊 Monitoring and Logging

### Application Monitoring
- Add error tracking (Sentry, Bugsnag)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (Pingdom, UptimeRobot)

### Logging Setup
```javascript
// Add to backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔒 Security Considerations

### Environment Security
- Never commit `.env` files
- Use secure JWT secrets (32+ characters)
- Enable MongoDB authentication
- Set up rate limiting

### Production Optimizations
```javascript
// Add to backend/server.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS settings
2. **Build Failures**: Check Node.js version compatibility
3. **Database Connection**: Verify MongoDB URI and network access
4. **WebSocket Issues**: Ensure platform supports WebSocket connections

### Debug Commands
```bash
# Check backend logs
docker logs stocksync-backend

# Test API endpoints
curl https://your-backend.com/api/products

# Check frontend build
cd StockSync && npm run build
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Verify environment variables
4. Test locally first

---

**Choose the deployment option that best fits your needs and budget. Railway + Netlify is recommended for beginners, while Docker provides the most control.**
