# QGJob Deployment Guide

This guide covers different deployment scenarios for the QGJob Test Orchestration System.

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- Redis server
- Git

### Setup
```bash
# Clone repository
git clone <repository-url>
cd qualgent

# Run setup script
./scripts/setup.sh          # Linux/macOS
# or
./scripts/setup.ps1         # Windows PowerShell

# Start server
cd server && npm run dev

# Test system
./scripts/test-system.sh     # Linux/macOS
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f qgjob-server

# Stop services
docker-compose down
```

### Manual Docker Setup
```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Build and run server
cd server
docker build -t qgjob-server .
docker run -d -p 3000:3000 --link redis \
  -e REDIS_URL=redis://redis:6379 \
  qgjob-server
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using ECS with Fargate
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  qgjob-server:
    image: your-registry/qgjob-server:latest
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://your-elasticache-endpoint:6379
      - NODE_ENV=production
```

#### Using EC2
```bash
# Install Docker and Docker Compose on EC2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
git clone <repository-url>
cd qualgent
docker-compose up -d
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/qgjob-server server/

# Deploy to Cloud Run
gcloud run deploy qgjob-server \
  --image gcr.io/PROJECT-ID/qgjob-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REDIS_URL=redis://REDIS-IP:6379
```

### Azure Deployment

#### Using Container Instances
```bash
# Create resource group
az group create --name qgjob-rg --location eastus

# Create Redis cache
az redis create --name qgjob-redis --resource-group qgjob-rg --location eastus --sku Basic --vm-size c0

# Deploy container
az container create \
  --resource-group qgjob-rg \
  --name qgjob-server \
  --image your-registry/qgjob-server:latest \
  --ports 3000 \
  --environment-variables REDIS_URL=redis://qgjob-redis.redis.cache.windows.net:6380
```

## 🔧 Production Configuration

### Environment Variables
```env
# Required
NODE_ENV=production
PORT=3000
REDIS_URL=redis://localhost:6379

# Optional
REDIS_PASSWORD=your-secure-password
LOG_LEVEL=info
MAX_CONCURRENT_JOBS=10
JOB_TIMEOUT=300000
```

### Redis Configuration
```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Nginx Configuration
```nginx
upstream qgjob {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://qgjob;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Basic health check
curl http://localhost:3000/api/health

# Detailed monitoring
curl http://localhost:3000/api/health | jq
```

### Logging Setup
```javascript
// Production logging with Winston
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

### Metrics Collection
```javascript
// Prometheus metrics
const promClient = require('prom-client');

const jobsTotal = new promClient.Counter({
  name: 'qgjob_jobs_total',
  help: 'Total number of jobs processed',
  labelNames: ['status', 'org_id']
});
```

## 🔒 Security Considerations

### API Security
- Use HTTPS in production
- Implement rate limiting
- Add API authentication
- Validate all inputs
- Use CORS properly

### Redis Security
- Use password authentication
- Enable TLS encryption
- Restrict network access
- Regular security updates

### Container Security
- Use non-root user
- Scan images for vulnerabilities
- Keep base images updated
- Use secrets management

## 🔄 CI/CD Pipeline

### GitHub Actions Production Deploy
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/qgjob-server:${{ github.sha }} server/
          docker push ${{ secrets.REGISTRY }}/qgjob-server:${{ github.sha }}
          
      - name: Deploy to production
        run: |
          # Your deployment commands here
```

## 🚨 Troubleshooting

### Common Issues

#### Redis Connection Failed
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
docker logs redis

# Test connection
telnet localhost 6379
```

#### High Memory Usage
```bash
# Monitor Redis memory
redis-cli info memory

# Check job queue size
redis-cli llen bull:test-jobs:waiting
```

#### Performance Issues
```bash
# Monitor server metrics
curl http://localhost:3000/api/health

# Check job processing times
# Review logs for bottlenecks
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test Redis connectivity
4. Review the troubleshooting section
5. Create an issue on GitHub
