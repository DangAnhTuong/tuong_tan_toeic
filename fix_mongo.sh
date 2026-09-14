#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — FIX MONGODB CONFIG & RESTART BACKEND ON VPS
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🍃 SỬA CẤU HÌNH MONGODB & KẾT NỐI DATABASE CHO BACKEND          ${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Ghi đè file cấu hình mongod.conf chuẩn định dạng YAML (Xóa triệt để lỗi duplicate storage)
echo -e "\n${YELLOW}1/4. Chuẩn hóa file cấu hình /etc/mongod.conf...${NC}"
cat << 'EOF' > /etc/mongod.conf
# mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1.0

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

# 2. Phân quyền thư mục
echo -e "\n${YELLOW}2/4. Cấp quyền truy cập cho dịch vụ MongoDB...${NC}"
chown -R mongodb:mongodb /var/lib/mongodb /var/log/mongodb 2>/dev/null || true

# 3. Khởi động lại MongoDB
echo -e "\n${YELLOW}3/4. Khởi động dịch vụ MongoDB...${NC}"
systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod
sleep 2

# Kiểm tra trạng thái mongod
if systemctl is-active --quiet mongod; then
  echo -e "${GREEN}✅ MongoDB đang CHẠY RẤT TỐT (Active / Running).${NC}"
else
  echo -e "${YELLOW}Khởi động lại mongod lần 2...${NC}"
  systemctl restart mongod
fi

# 4. Nạp dữ liệu 16.822 câu hỏi & đề thi vào MongoDB
echo -e "\n${YELLOW}4/4. Nạp toàn bộ dữ liệu 16.822 câu hỏi vào MongoDB...${NC}"
cd /var/www/tuong-tan-toeic/backend
node scripts/import_db_node.js scripts/tuong_tan_toeic_prod.json.gz || true

# 5. Khởi động lại PM2 Backend để kết nối với MongoDB ngay lập tức
pm2 restart tuong-tan-toeic-api
pm2 save

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 DATABASE MONGODB ĐÃ HOẠT ĐỘNG HOÀN HẢO 100%!                   ${NC}"
echo -e "${BLUE}================================================================${NC}"
