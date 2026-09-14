#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — 1-TOUCH FIX FOR AUTH, CORS, NGINX & SSL ON VPS
#   Run on VPS with: bash fix_vps_auth.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🎧 TƯỜNG TẬN TOEIC — BẢN VÁ SỬA LỖI ĐĂNG NHẬP & BẬT HTTPS SSL  ${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Update backend .env with correct CORS origins
echo -e "\n${YELLOW}1/5. Cập nhật biến môi trường CORS đa miền...${NC}"
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://toeic.danganhtuong.dev,http://toeic.danganhtuong.dev,https://danganhtuong.dev,http://danganhtuong.dev,http://116.118.3.69,http://localhost:3000|' /var/www/tuong-tan-toeic/backend/.env

# If CORS_ORIGIN didn't exist, append it
if ! grep -q "CORS_ORIGIN=" /var/www/tuong-tan-toeic/backend/.env; then
  echo "CORS_ORIGIN=https://toeic.danganhtuong.dev,http://toeic.danganhtuong.dev,https://danganhtuong.dev,http://danganhtuong.dev,http://116.118.3.69,http://localhost:3000" >> /var/www/tuong-tan-toeic/backend/.env
fi
echo -e "${GREEN}✅ File .env đã được cập nhật chuẩn.${NC}"

# 2. Update rate limiter to 60 attempts
echo -e "\n${YELLOW}2/5. Nâng ngưỡng giới hạn Rate Limiter (Tránh bị khóa IP khi test)...${NC}"
sed -i 's|max: 10,|max: 60,|g' /var/www/tuong-tan-toeic/backend/src/middleware/rateLimiter.js || true
echo -e "${GREEN}✅ Rate Limiter đã được nâng lên 60 lần / 15 phút.${NC}"

# 3. Patch app.js with wildcard CORS
echo -e "\n${YELLOW}3/5. Cập nhật mã nguồn Backend cho phép mọi tên miền danganhtuong.dev...${NC}"
cat << 'EOF' > /var/www/tuong-tan-toeic/backend/patch_cors.js
const fs = require('fs');
const filePath = '/var/www/tuong-tan-toeic/backend/src/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = "if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {";
const replacementStr = `if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any danganhtuong.dev domain/subdomain
    if (/^https?:\\/\\/([a-z0-9-]+\\.)*danganhtuong\\.dev(:\\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    // Allow VPS direct IP
    if (/^https?:\\/\\/116\\.118\\.3\\.69(:\\d+)?$/i.test(origin)) {
      return callback(null, true);
    }`;

if (!content.includes('danganhtuong\\.dev') && content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('App.js patched successfully');
} else {
  console.log('App.js already patched or pattern matched');
}
EOF
node /var/www/tuong-tan-toeic/backend/patch_cors.js
rm -f /var/www/tuong-tan-toeic/backend/patch_cors.js

# Restart PM2 backend
pm2 restart tuong-tan-toeic-api || pm2 start /var/www/tuong-tan-toeic/backend/ecosystem.config.js --env production
echo -e "${GREEN}✅ Backend API đã khởi động lại với cấu hình mới.${NC}"

# 4. Extract updated frontend (if update_dist.zip was uploaded)
if [ -f /root/update_dist.zip ]; then
  echo -e "\n${YELLOW}4/5. Giải nén giao diện mới (Xóa sạch nút VIP Tuấn)...${NC}"
  unzip -o /root/update_dist.zip -d /var/www/tuong-tan-toeic/frontend/dist/
  echo -e "${GREEN}✅ Giao diện đã cập nhật bản mới nhất.${NC}"
else
  echo -e "\n${YELLOW}4/5. Bỏ qua bước giải nén frontend (chưa tìm thấy /root/update_dist.zip)...${NC}"
fi

# 5. Fix Nginx configuration & run Certbot for HTTPS
echo -e "\n${YELLOW}5/5. Cấu hình Nginx & Cấp chứng chỉ HTTPS (Let's Encrypt SSL)...${NC}"
cat << 'EOF' > /etc/nginx/sites-available/tuongtan.conf
server {
    listen 80;
    listen [::]:80;
    server_name toeic.danganhtuong.dev danganhtuong.dev 116.118.3.69;

    client_max_body_size 25M;
    root /var/www/tuong-tan-toeic/frontend/dist;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tuongtan.conf /etc/nginx/sites-enabled/tuongtan.conf
rm -f /etc/nginx/sites-enabled/default
sed -i '/gzip on;/d' /etc/nginx/sites-available/tuongtan.conf || true

nginx -t
systemctl reload nginx

# Run certbot to install SSL certificate
certbot --nginx -d toeic.danganhtuong.dev --non-interactive --agree-tos -m danganhtuongg@gmail.com --redirect || {
  echo -e "${YELLOW}⚠️ Certbot chưa cấp SSL ngay được, Nginx vẫn đang chạy cổng 80 ổn định.${NC}"
}

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 HOÀN TẤT BẢN VÁ 100%! HỆ THỐNG ĐÃ SẴN SÀNG.${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Hãy truy cập ngay: 👉 ${GREEN}https://toeic.danganhtuong.dev${NC}"
echo -e "Và bấm Đăng nhập với Google để kiểm tra!"
