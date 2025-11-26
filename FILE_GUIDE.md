# 🎯 Essential Files - Quick Reference

After cleanup, here are the **only files** you need to know about:

---

## 📚 **Documentation** (4 files)

1. **`README.md`** - Main project documentation
2. **`FILE_GUIDE.md`** - This guide explaining file organization
3. **`AWS_DEPLOYMENT_GUIDE.md`** - Complete AWS deployment instructions
4. **`SUBMISSION.md`** - Lab submission checklist

---

## � **Docker Configuration** (2 files)

1. **`docker-compose.yml`** ⭐ **For LOCAL development**
   - Run on your Mac
   - Command: `docker compose up -d`

2. **`docker-compose.ec2.yml`** ⭐ **For AWS/EC2 deployment**
   - Run on AWS EC2
   - Used by deployment scripts

---

## 🚀 **Deployment Scripts** (4 files)

### AWS Deployment:
1. **`launch-ec2.sh`** ⭐ - Create new EC2 instance (interactive, finds latest AMI)
2. **`deploy-to-ec2.sh`** ⭐ - Deploy application to existing EC2 instance

### Local Development:
3. **`start-docker.sh`** - Start all local Docker services
4. **`kill-all-services.sh`** - Stop all local services

---

## � **What to Use When**

### Running Locally (on your Mac):
```bash
# Start all services
docker compose up -d

# Or use helper script
./start-docker.sh

# Stop services
./kill-all-services.sh
```

### Deploying to AWS:
```bash
# Step 1: Create new EC2 instance (if needed)
./launch-ec2.sh

# Step 2: Deploy application to EC2
./deploy-to-ec2.sh
```

---

## � **Backup**

All removed files are backed up in `.backup_docs/` if you need them later.

---

## � **Important Files Not Listed Above**

- `.env` - Your environment variables (API keys, etc.)
- `backend/` - Backend source code
- `frontend/` - Frontend source code
- `ai-agent/` - AI agent source code
- `database/` - Database initialization scripts

---

**That's it! Much cleaner now! 🎉**
