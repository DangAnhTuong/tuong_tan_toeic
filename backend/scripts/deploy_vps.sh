#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — 1-CLICK PRODUCTION VPS PROVISIONING (HETZNER CX22)
#   Target OS: Ubuntu 22.04 / 24.04 LTS
#   Hardware: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB SSD)
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🎧 TUONG TAN TOEIC — VPS AUTOMATED SETUP SCRIPT               ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Vui long chay script voi quyen root (sudo ./deploy_vps.sh)${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 1. SYSTEM UPDATE & ESSENTIAL TOOLS
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}📦 1/8. Dang cap nhat he thong va cai dat cong cu thiet yeu...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git unzip htop ufw fail2ban gnupg lsb-release build-essential

# ------------------------------------------------------------------------------
# 2. CREATE 4GB SWAP FILE (PREVENTS OOM KILLS ON 4GB RAM VPS)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}💾 2/8. Dang thiet lap 4GB Swap file (chong tran RAM)...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo -e "${GREEN}✅ Swap 4GB da duoc kich hoat thanh cong!${NC}"
else
    echo -e "${GREEN}✅ Swap file da ton tai, bo qua buoc nay.${NC}"
fi

# ------------------------------------------------------------------------------
# 3. INSTALL NODE.JS 20 LTS & PM2
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}⚙️ 3/8. Dang cai dat Node.js 20 LTS va PM2...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✅ Node.js $(node -v) / npm $(npm -v) da cai dat xong.${NC}"

npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
echo -e "${GREEN}✅ PM2 va pm2-logrotate da duoc cau hinh.${NC}"

# ------------------------------------------------------------------------------
# 4. INSTALL MONGODB 7.0 COMMUNITY EDITION & TUNE CACHE
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}🍃 4/8. Dang cai dat MongoDB 7.0 Community Edition...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
    
    UBUNTU_CODENAME=$(lsb_release -cs)
    # Ubuntu 24.04 fallback to jammy repo if noble not yet published
    if [ "$UBUNTU_CODENAME" = "noble" ]; then
        UBUNTU_CODENAME="jammy"
    fi
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    apt update
    apt install -y mongodb-org
fi

# Gioi han cache WiredTiger xuong 1GB de khong an sach RAM 4GB
if ! grep -q "cacheSizeGB" /etc/mongod.conf; then
    echo -e "\nstorage:\n  wiredTiger:\n    engineConfig:\n      cacheSizeGB: 1.0" >> /etc/mongod.conf
fi

systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod
echo -e "${GREEN}✅ MongoDB 7.0 dang chay tren 127.0.0.1:27017 (Cache 1GB).${NC}"

# ------------------------------------------------------------------------------
# 5. INSTALL NGINX & CERTBOT
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}🌐 5/8. Dang cai dat Nginx va Certbot (Let's Encrypt SSL)...${NC}"
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
echo -e "${GREEN}✅ Nginx da san sang.${NC}"

# ------------------------------------------------------------------------------
# 6. CONFIGURE UFW FIREWALL
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}🛡️ 6/8. Dang bat tuong lua UFW (Khoa toan bo, chi mo 22, 80, 443)...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✅ Tuong lua UFW da bat an toan.${NC}"

# ------------------------------------------------------------------------------
# 7. CREATE DIRECTORY STRUCTURE
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}📁 7/8. Dang khoi tao thu muc ung dung /var/www/tuong-tan-toeic...${NC}"
mkdir -p /var/www/tuong-tan-toeic
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/www/tuong-tan-toeic
chmod -R 755 /var/www/tuong-tan-toeic

# ------------------------------------------------------------------------------
# 8. SUMMARY & NEXT STEPS
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 CAI DAT HA TANG VPS HOAN TAT 100%!${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Cac buoc tiep theo de day code len:"
echo -e "  1. Copy source code vao /var/www/tuong-tan-toeic/"
echo -e "  2. Chay restore DB: bash backend/scripts/restore_db.sh tuong_tan_toeic_prod.archive"
echo -e "  3. Vao backend va khoi dong PM2:"
echo -e "     cd /var/www/tuong-tan-toeic/backend && npm install --production"
echo -e "     pm2 start ecosystem.config.js --env production"
echo -e "     pm2 save && pm2 startup"
echo -e "  4. Copy nginx_tuongtan.conf vao /etc/nginx/sites-available/ va tao symlink"
echo -e "  5. Chay certbot cap SSL: certbot --nginx -d yourdomain.com"
echo -e "${BLUE}================================================================${NC}"
