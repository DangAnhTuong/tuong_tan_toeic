#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — ALL-IN-ONE 1-CLICK PRODUCTION DEPLOYER FOR VPS
#   Location: /var/www/tuong-tan-toeic/backend/scripts/setup_production.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🎧 TUONG TAN TOEIC — ALL-IN-ONE AUTOMATED PRODUCTION SETUP     ${NC}"
echo -e "${GREEN}  Target VPS: 116.118.3.69                                     ${NC}"
echo -e "${BLUE}================================================================${NC}"

APP_DIR="/var/www/tuong-tan-toeic"
BACKEND_DIR="$APP_DIR/backend"

# 1. RUN BASE VPS INFRASTRUCTURE PROVISIONING
echo -e "\n${YELLOW}⚙️ BƯỚC 1/5: Cài đặt hạ tầng VPS (Node 20, Mongo 7, Nginx, PM2, Swap 4GB)...${NC}"
bash "$BACKEND_DIR/scripts/deploy_vps.sh"

# 2. CONFIGURE PRODUCTION .ENV FILE
echo -e "\n${YELLOW}🔐 BƯỚC 2/5: Khởi tạo biến môi trường sản xuất (.env)...${NC}"
cat << 'EOF' > "$BACKEND_DIR/.env"
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/tuong_tan_toeic
JWT_SECRET=tuong_tan_toeic_production_super_secret_jwt_2026_x89a
CORS_ORIGIN=http://116.118.3.69,http://localhost:3000
ADMIN_EMAILS=danganhtuongg@gmail.com
BANK_ID=MB
BANK_ACCOUNT_NO=0335847674
BANK_ACCOUNT_NAME=DANG ANH TUONG
PAYMENT_WEBHOOK_SECRET=tuong_tan_toeic_sepay_webhook_secret_2026
EOF
echo -e "${GREEN}✅ File .env đã được tạo chuẩn.${NC}"

# 3. INSTALL DEPENDENCIES & START PM2
echo -e "\n${YELLOW}🚀 BƯỚC 3/5: Cài đặt thư viện npm (mongoose, express, v.v.)...${NC}"
cd "$BACKEND_DIR"
npm install --production --no-audit --no-fund

# 4. IMPORT MONGODB DATABASE
echo -e "\n${YELLOW}📦 BƯỚC 4/5: Nạp toàn bộ 16.822 câu hỏi & 10 bộ đề thi vào MongoDB...${NC}"
node scripts/import_db_node.js scripts/tuong_tan_toeic_prod.json.gz

pm2 delete tuong-tan-toeic-api || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root || true

# 5. CONFIGURE NGINX
echo -e "\n${YELLOW}🌐 BƯỚC 5/5: Cấu hình Nginx và định tuyến web...${NC}"
cp "$BACKEND_DIR/scripts/nginx_tuongtan.conf" /etc/nginx/sites-available/tuongtan.conf
ln -sf /etc/nginx/sites-available/tuongtan.conf /etc/nginx/sites-enabled/tuongtan.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 CHÚC MỪNG BẠN! HỆ THỐNG TƯỜNG TẬN TOEIC ĐÃ ONLINE 100%!     ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Truy cập ngay trên trình duyệt điện thoại hoặc máy tính:"
echo -e "👉 ${GREEN}http://116.118.3.69${NC}"
echo -e "API Gateway: ${YELLOW}http://116.118.3.69/health${NC}"
echo -e "${BLUE}================================================================${NC}"
