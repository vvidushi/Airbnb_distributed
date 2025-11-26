# AWS EC2 Operations Manual: Airbnb Distributed System

This document is your single source of truth for deploying, managing, and updating the Airbnb Distributed System on AWS EC2.

## 📋 1. Initial Setup & Deployment

**Prerequisites:**
- AWS Account with valid payment method.
- Terminal with `ssh` and `scp` installed.
- Downloaded `.pem` key pair from AWS.

### Step 1: Launch Instance
1.  **Instance Type:** `t2.micro` (Free Tier) or `t2.small` (Recommended, $17/mo).
2.  **OS:** Ubuntu 22.04 LTS (x86_64).
3.  **Storage:** 20GB gp3.
4.  **Security Group (Firewall):**
    *   Allow SSH (22) from My IP.
    *   Allow TCP 3000 (Frontend) from Anywhere (`0.0.0.0/0`).
    *   Allow TCP 5001 (Backend) from Anywhere (`0.0.0.0/0`).
    *   Allow TCP 8000 (AI Agent) from Anywhere (`0.0.0.0/0`).

### Step 2: Run Deployment Script
This script sets up Docker, Swap memory, and deploys the app.

```bash
# 1. chmod your key
chmod 400 ~/Downloads/airbnb-key.pem

# 2. Run script
./deploy-to-ec2.sh
```
*Follow the prompts to enter your EC2 Public IP and Key path.*

---

## 🔄 2. Updating Code ("Flashing" to EC2)

Use these methods to update your live application based on what changed.

### Scenario A: Updating a Single Backend File (Fastest)
*Best for: Config changes, small logic fixes in backend/AI.*

1.  **Copy the file** to the server:
    ```bash
    scp -i ~/Downloads/airbnb-key.pem \
      local/path/to/file.js \
      ubuntu@<EC2_IP>:~/airbnb-app/backend/src/path/to/file.js
    ```

2.  **Rebuild & Restart** the service:
    ```bash
    ssh -i ~/Downloads/airbnb-key.pem ubuntu@<EC2_IP> \
      "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml up -d --build backend"
    ```
    *(Replace `backend` with `ai-agent` or `kafka-producer` as needed)*

### Scenario B: Updating Frontend (React)
*Best for: UI changes, CSS, React components. Requires full rebuild.*

1.  **Update environment variables** (if API URL changed):
    ```bash
    ssh -i ~/Downloads/airbnb-key.pem ubuntu@<EC2_IP> \
      "echo 'REACT_APP_API_URL=http://<EC2_IP>:5001' >> ~/airbnb-app/.env"
    ```

2.  **Upload Source Code** (or specific changed files):
    ```bash
    # Upload entire frontend folder (exclude node_modules locally first!)
    scp -r -i ~/Downloads/airbnb-key.pem frontend/ ubuntu@<EC2_IP>:~/airbnb-app/
    ```

3.  **Rebuild Container**:
    ```bash
    ssh -i ~/Downloads/airbnb-key.pem ubuntu@<EC2_IP> \
      "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml up -d --build frontend"
    ```

### Scenario C: Full Redeployment (Clean Slate)
*Best for: Major version upgrades or if everything is broken.*

```bash
./deploy-to-ec2.sh
```
*(This will stop existing containers, upload new code, and restart. Data in `/data` volumes will persist.)*

---

## ⚙️ 3. Operational Commands

Run these on your local machine to manage the remote server.

**Variables:**
- `KEY`: Path to .pem file (e.g., `~/Downloads/airbnb-key.pem`)
- `IP`: EC2 Public IP

### Access & Logs
| Action | Command |
| :--- | :--- |
| **SSH Login** | `ssh -i $KEY ubuntu@$IP` |
| **Live Logs (All)** | `ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml logs -f"` |
| **Backend Logs** | `ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml logs -f backend"` |
| **Frontend Logs** | `ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml logs -f frontend"` |

### Service Management
| Action | Command |
| :--- | :--- |
| **Restart All** | `ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml restart"` |
| **Stop All** | `ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml down"` |
| **Check Status** | `ssh -i $KEY ubuntu@$IP "sudo docker ps"` |

### Database Management (SQLite)
The database is stored at `~/airbnb-app/data/airbnb.db`.

**Backup Database:**
```bash
scp -i $KEY ubuntu@$IP:~/airbnb-app/data/airbnb.db ./backup.db
```

**Reset Database (Delete Data):**
```bash
ssh -i $KEY ubuntu@$IP "sudo rm ~/airbnb-app/data/airbnb.db && sudo docker compose -f docker-compose.ec2.yml restart backend"
```

---

## 🔧 4. Troubleshooting Common Issues

### 1. "Connection Refused" or Timeout
*   **Check Security Groups:** Ensure ports 3000, 5001, 8000 are open in AWS Console.
*   **Check Backend:** `curl http://<EC2_IP>:5001/health`

### 2. "401 Unauthorized" on Image Upload
*   **Cause:** Secure cookies over HTTP.
*   **Fix:** Ensure `FORCE_INSECURE_COOKIES=true` is in `.env` and restart backend.
    ```bash
    ssh -i $KEY ubuntu@$IP "grep FORCE_INSECURE ~/airbnb-app/.env || echo 'FORCE_INSECURE_COOKIES=true' >> ~/airbnb-app/.env"
    ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml up -d backend"
    ```

### 3. Images Not Loading
*   **Cause:** Backend returning `localhost` URLs.
*   **Fix:** Update `BACKEND_URL` in `.env` to Public IP.
    ```bash
    ssh -i $KEY ubuntu@$IP "echo 'BACKEND_URL=http://<EC2_IP>:5001' >> ~/airbnb-app/.env"
    ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml up -d backend"
    ```

### 4. AI Agent CORS Error
*   **Cause:** Frontend rejected by AI Agent.
*   **Fix:** Ensure AI Agent allows all origins (`*`).
    *   Edit `ai-agent/simple_main.py`.
    *   Upload and Rebuild:
    ```bash
    scp -i $KEY ai-agent/simple_main.py ubuntu@$IP:~/airbnb-app/ai-agent/
    ssh -i $KEY ubuntu@$IP "cd ~/airbnb-app && sudo docker compose -f docker-compose.ec2.yml up -d --build ai-agent"
    ```
