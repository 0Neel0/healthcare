# 🐳 Hospital Management System - Docker Deployment Guide

Complete guide for deploying HMS using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Manual Deployment](#manual-deployment)
- [Accessing Services](#accessing-services)
- [Managing Containers](#managing-containers)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

### Required Software

- **Docker Desktop** (version 20.10+)
  - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Mac: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: Install Docker Engine and Docker Compose

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free
- **OS**: Windows 10/11, macOS 10.15+, or Linux

### API Keys Required

You'll need the following API keys:
- Google Gemini API Key
- Razorpay API credentials (for payments)
- Twilio credentials (for SMS)
- Cloudinary credentials (for file storage)
- Google OAuth credentials

---

## 🚀 Quick Start

### Windows

1. **Open PowerShell** in the HMS project directory:
   ```powershell
   cd c:\HMS
   ```

2. **Run the deployment script**:
   ```powershell
   .\scripts\deploy.ps1
   ```

3. **Follow the prompts** to configure your environment variables.

### Linux/Mac

1. **Make scripts executable**:
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Run the deployment script**:
   ```bash
   ./scripts/deploy.sh
   ```

---

## ⚙️ Environment Configuration

### Step 1: Create .env File

If `.env` doesn't exist, copy from the example:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file and fill in your actual credentials:

```env
# Database
MONGO_URI=mongodb://mongodb:27017/healthcare_db

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> [!WARNING]
> Never commit your `.env` file to version control! It contains sensitive credentials.

---

## 🛠️ Manual Deployment

If you prefer to deploy manually without the script:

### 1. Build Images

```bash
docker-compose build --no-cache
```

This builds fresh images for:
- Frontend (React + Nginx)
- Backend (Node.js + Express)
- AI Service (Python + FastAPI)

### 2. Start Services

```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (background).

### 3. Check Status

```bash
docker-compose ps
```

All services should show "Up" status with health checks passing.

---

## 🌐 Accessing Services

Once deployed, access the services at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:4000 | REST API endpoints |
| **AI Service** | http://localhost:8000/docs | FastAPI documentation |
| **MongoDB** | localhost:27017 | Database (internal) |

### API Health Checks

```bash
# Backend health check
curl http://localhost:4000/api/health

# AI Service health check
curl http://localhost:8000/health

# Frontend health check
curl http://localhost:5173/health
```

---

## 🎛️ Managing Containers

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-service
docker-compose logs -f mongodb
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
# Using script (Windows)
.\scripts\stop.ps1

# Using script (Linux/Mac)
./scripts/stop.sh

# Or manually
docker-compose down
```

### Remove Everything (Including Data)

> [!CAUTION]
> This will delete all database data and uploaded files!

```bash
docker-compose down -v
```

### Rebuild Single Service

```bash
# Rebuild backend only
docker-compose build backend
docker-compose up -d backend
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:5173 failed: port is already allocated`

**Solution**:
```bash
# Find and stop the process using the port
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

Or change the port in `docker-compose.yml`.

#### 2. MongoDB Connection Failed

**Symptom**: Backend can't connect to MongoDB

**Solution**:
- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify `MONGO_URI` in `.env` uses `mongodb://mongodb:27017/healthcare_db`

#### 3. Frontend Shows Blank Page

**Possible Causes**:
- Build failed
- Nginx configuration issue

**Solution**:
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 4. API Keys Not Working

**Symptom**: AI features not working, payments failing

**Solution**:
- Verify `.env` file exists in the root directory
- Check that `env_file: - .env` is in `docker-compose.yml`
- Restart services after updating `.env`

#### 5. File Uploads Not Working

**Symptom**: Uploaded files disappear after restart

**Solution**:
- Ensure volumes are properly configured
- Check: `docker volume ls` - should see `hms_uploads_data`
- Files are shared between backend and ai-service

### Debugging Commands

```bash
# Execute commands inside container
docker exec -it hms_backend sh
docker exec -it hms_ai_service bash

# Inspect container
docker inspect hms_backend

# View container resource usage
docker stats

# Remove unused images and volumes
docker system prune -a
```

---

## 🏭 Production Deployment

> [!IMPORTANT]
> The current Docker setup is optimized for development. For production:

### Security Checklist

- [ ] Enable MongoDB authentication
- [ ] Use strong, unique `JWT_SECRET`
- [ ] Configure SSL/TLS certificates
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific `.env` files
- [ ] Restrict MongoDB port (remove public binding)
- [ ] Enable firewall rules
- [ ] Configure CORS properly
- [ ] Use Docker secrets for sensitive data

### MongoDB Authentication

Update `docker-compose.yml`:

```yaml
mongodb:
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=your_secure_password

backend:
  environment:
    - MONGO_URI=mongodb://admin:your_secure_password@mongodb:27017/healthcare_db?authSource=admin
```

### SSL/TLS Configuration

For production, use a reverse proxy (Nginx/Traefik) with SSL certificates:

```yaml
# Add to docker-compose.yml
nginx-proxy:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/ssl:/etc/nginx/ssl
    - ./nginx/conf.d:/etc/nginx/conf.d
```

### Environment Variables

Create separate `.env` files:
- `.env.development`
- `.env.staging`
- `.env.production`

Load appropriate file:
```bash
docker-compose --env-file .env.production up -d
```

### Scaling

Scale specific services:
```bash
docker-compose up -d --scale backend=3
```

For advanced orchestration, consider:
- **Docker Swarm**: Built-in orchestration
- **Kubernetes**: Enterprise-grade orchestration

### Monitoring & Logging

Add monitoring services:
```yaml
# Prometheus for metrics
prometheus:
  image: prom/prometheus

# Grafana for visualization
grafana:
  image: grafana/grafana
```

### Backup Strategy

```bash
# Backup MongoDB
docker exec hms_mongodb mongodump --out /backup

# Backup volumes
docker run --rm -v hms_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz /data
```

### Cloud Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed cloud deployment guides for:
- AWS (ECS, EC2)
- Google Cloud (GKE, Cloud Run)
- Azure (AKS, Container Instances)
- DigitalOcean (App Platform, Droplets)

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `docker-compose logs`
3. Verify `.env` configuration
4. Ensure all required ports are available
5. Check Docker Desktop is running with sufficient resources

---

**Last Updated**: 2026-01-01
