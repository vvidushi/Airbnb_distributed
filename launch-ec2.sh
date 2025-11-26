#!/bin/bash

# EC2 Instance Launch Script for Airbnb Deployment
# Uses AWS CLI to create optimized instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================="
echo "🚀 AWS EC2 Instance Launch"
echo "=============================================="
echo -e "${NC}"

# Configuration
REGION="us-east-1"
AWS_PROFILE="airbnb"
PROJECT_NAME="airbnb-app"
KEY_NAME="${PROJECT_NAME}-key"
SECURITY_GROUP_NAME="${PROJECT_NAME}-sg"

# Get user preferences
echo -e "${YELLOW}📋 Instance Configuration${NC}"
echo ""
echo "Choose instance type:"
echo "  1) t2.micro  (1GB RAM, FREE tier - $0/month for 12 months) ⭐ Recommended"
echo "  2) t2.small  (2GB RAM, $17/month - more headroom)"
echo ""
read -p "Enter choice (1 or 2): " INSTANCE_CHOICE

if [ "$INSTANCE_CHOICE" == "1" ]; then
    INSTANCE_TYPE="t2.micro"
    echo -e "${GREEN}Selected: t2.micro (FREE tier)${NC}"
else
    INSTANCE_TYPE="t2.small"
    echo -e "${GREEN}Selected: t2.small${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Checking AWS configuration...${NC}"

# Check if profile exists
if ! aws configure list-profiles | grep -q "^${AWS_PROFILE}$"; then
    echo -e "${RED}❌ AWS profile '${AWS_PROFILE}' not found${NC}"
    echo "Available profiles:"
    aws configure list-profiles
    exit 1
fi

echo -e "${GREEN}✅ AWS profile '${AWS_PROFILE}' found${NC}"

# Get account info
echo -e "${BLUE}📊 AWS Account Info:${NC}"
aws sts get-caller-identity --profile $AWS_PROFILE

echo ""
echo -e "${BLUE}🔐 Step 1: Setting up Key Pair...${NC}"

# Check if key pair exists
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region $REGION --profile $AWS_PROFILE &>/dev/null; then
    echo -e "${YELLOW}⚠️  Key pair '$KEY_NAME' already exists${NC}"
    echo "Using existing key pair"
    
    if [ ! -f ~/Downloads/${KEY_NAME}.pem ]; then
        echo -e "${RED}❌ Key file not found: ~/Downloads/${KEY_NAME}.pem${NC}"
        echo "You'll need to use your existing key file or delete the key pair and run again"
    fi
else
    echo "Creating new key pair: $KEY_NAME"
    aws ec2 create-key-pair \
        --key-name "$KEY_NAME" \
        --region $REGION \
        --profile $AWS_PROFILE \
        --query 'KeyMaterial' \
        --output text > ~/Downloads/${KEY_NAME}.pem
    
    chmod 400 ~/Downloads/${KEY_NAME}.pem
    echo -e "${GREEN}✅ Key saved to: ~/Downloads/${KEY_NAME}.pem${NC}"
fi

echo ""
echo -e "${BLUE}🔒 Step 2: Setting up Security Group...${NC}"

# Check if security group exists
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null)

if [ "$SG_ID" != "None" ] && [ ! -z "$SG_ID" ]; then
    echo -e "${YELLOW}⚠️  Security group already exists: $SG_ID${NC}"
else
    echo "Creating security group: $SECURITY_GROUP_NAME"
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$SECURITY_GROUP_NAME" \
        --description "Security group for Airbnb distributed system" \
        --region $REGION \
        --profile $AWS_PROFILE \
        --query 'GroupId' \
        --output text)
    
    echo -e "${GREEN}✅ Created security group: $SG_ID${NC}"
    
    echo "Adding security rules..."
    
    # SSH (22)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # HTTP (80)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # HTTPS (443)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # Frontend (3000)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 3000 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # Backend API (5001)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 5001 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # Kafka Producer (5002)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 5002 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    # AI Agent (8000)
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 8000 \
        --cidr 0.0.0.0/0 \
        --region $REGION \
        --profile $AWS_PROFILE > /dev/null
    
    echo -e "${GREEN}✅ Security rules configured${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Step 3: Finding Ubuntu AMI...${NC}"

# Get latest Ubuntu 22.04 LTS AMI
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --region $REGION \
    --profile $AWS_PROFILE \
    --output text)

echo -e "${GREEN}✅ Using AMI: $AMI_ID (Ubuntu 22.04 LTS)${NC}"

echo ""
echo -e "${BLUE}🚀 Step 4: Launching EC2 Instance...${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Region: $REGION"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  AMI: $AMI_ID"
echo "  Security Group: $SG_ID"
echo "  Key: $KEY_NAME"
echo ""

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${PROJECT_NAME}-server},{Key=Project,Value=airbnb}]" \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}✅ Instance launched: $INSTANCE_ID${NC}"

echo ""
echo -e "${BLUE}⏳ Waiting for instance to start (this takes 1-2 minutes)...${NC}"

aws ec2 wait instance-running \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --profile $AWS_PROFILE

echo -e "${GREEN}✅ Instance is running!${NC}"

echo ""
echo -e "${BLUE}📡 Getting instance details...${NC}"

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

PUBLIC_DNS=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --profile $AWS_PROFILE \
    --query 'Reservations[0].Instances[0].PublicDnsName' \
    --output text)

echo ""
echo -e "${GREEN}=============================================="
echo "🎉 EC2 Instance Created Successfully!"
echo "=============================================="
echo -e "${NC}"
echo -e "${BLUE}Instance Details:${NC}"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP:   $PUBLIC_IP"
echo "  Public DNS:  $PUBLIC_DNS"
echo "  Type:        $INSTANCE_TYPE"
echo "  Region:      $REGION"
echo ""
echo -e "${BLUE}Connection:${NC}"
echo "  SSH Command: ssh -i ~/Downloads/${KEY_NAME}.pem ubuntu@${PUBLIC_IP}"
echo "  Key File:    ~/Downloads/${KEY_NAME}.pem"
echo ""
echo -e "${BLUE}Access URLs (after deployment):${NC}"
echo "  Frontend:    http://${PUBLIC_IP}:3000"
echo "  Backend API: http://${PUBLIC_IP}:5001"
echo "  AI Agent:    http://${PUBLIC_IP}:8000"
echo ""
echo -e "${YELLOW}⏳ Please wait 2-3 minutes for instance initialization${NC}"
echo ""
echo -e "${GREEN}🚀 Next Step: Deploy your application${NC}"
echo ""
echo "Run this command to deploy:"
echo -e "${BLUE}  ./deploy-to-ec2.sh${NC}"
echo ""
echo "When prompted, enter:"
echo "  EC2 IP: ${PUBLIC_IP}"
echo "  Key file: ~/Downloads/${KEY_NAME}.pem"
echo ""

# Save instance info to file
cat > ec2-instance-info.txt << EOF
EC2 Instance Information
========================
Created: $(date)

Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Public DNS: $PUBLIC_DNS
Instance Type: $INSTANCE_TYPE
Region: $REGION
Key Name: $KEY_NAME
Key File: ~/Downloads/${KEY_NAME}.pem
Security Group: $SG_ID

SSH Command:
ssh -i ~/Downloads/${KEY_NAME}.pem ubuntu@${PUBLIC_IP}

URLs (after deployment):
- Frontend: http://${PUBLIC_IP}:3000
- Backend:  http://${PUBLIC_IP}:5001
- AI Agent: http://${PUBLIC_IP}:8000

Next Steps:
1. Wait 2-3 minutes for instance initialization
2. Run: ./deploy-to-ec2.sh
3. Enter IP: ${PUBLIC_IP}
4. Enter Key: ~/Downloads/${KEY_NAME}.pem
EOF

echo -e "${GREEN}✅ Instance info saved to: ec2-instance-info.txt${NC}"
echo ""
echo -e "${BLUE}💰 Cost:${NC}"
if [ "$INSTANCE_TYPE" == "t2.micro" ]; then
    echo "  t2.micro: $0/month (FREE tier for 12 months)"
else
    echo "  t2.small: ~$17/month"
fi
echo ""

