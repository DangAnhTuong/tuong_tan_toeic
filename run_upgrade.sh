#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — 1-TOUCH PRODUCTION UPGRADE TO COMMERCIAL OIDC & SSL
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🎧 TƯỜNG TẬN TOEIC — BẢN VÁ THƯƠNG MẠI CHUẨN ĐẬU TOEIC         ${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Unzip packages
echo -e "\n${YELLOW}1/6. Giải nén các gói cập nhật Frontend & Backend...${NC}"
unzip -o /root/deploy_patch.zip -d /root/
mkdir -p /root/backend_files
unzip -o /root/update_backend.zip -d /root/backend_files/

# 2. Deploy backend files
echo -e "\n${YELLOW}2/6. Cập nhật mã nguồn Backend (Xác thực Google OIDC & CORS)...${NC}"
cp -f /root/backend_files/app.js /var/www/tuong-tan-toeic/backend/src/app.js
cp -f /root/backend_files/auth.controller.js /var/www/tuong-tan-toeic/backend/src/controllers/auth.controller.js
cp -f /root/backend_files/rateLimiter.js /var/www/tuong-tan-toeic/backend/src/middleware/rateLimiter.js
cp -f /root/backend_files/package.json /var/www/tuong-tan-toeic/backend/package.json

# 3. Deploy frontend dist
echo -e "\n${YELLOW}3/6. Cập nhật giao diện Frontend (Xóa nút test VIP Tuấn)...${NC}"
unzip -o /root/update_dist.zip -d /var/www/tuong-tan-toeic/frontend/dist/

# 4. Install google-auth-library on backend & update .env
echo -e "\n${YELLOW}4/6. Cài đặt thư viện bảo mật google-auth-library & cập nhật .env...${NC}"
cd /var/www/tuong-tan-toeic/backend
npm install --production --no-audit --no-fund google-auth-library
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://toeic.danganhtuong.dev,http://toeic.danganhtuong.dev,https://danganhtuong.dev,http://danganhtuong.dev,http://116.118.3.69,http://localhost:3000|' .env
if ! grep -q "GOOGLE_CLIENT_ID=" .env; then
  echo "GOOGLE_CLIENT_ID=151027052858-mmdiucsj3s8ddkmfk0rieanmhojts1np.apps.googleusercontent.com" >> .env
fi
pm2 restart tuong-tan-toeic-api

# 5. Fix Nginx configuration
echo -e "\n${YELLOW}5/6. Cấu hình Nginx Virtual Host...${NC}"
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

# 6. Issue SSL
echo -e "\n${YELLOW}6/6. Kích hoạt chứng chỉ HTTPS Let's Encrypt SSL...${NC}"
certbot --nginx -d toeic.danganhtuong.dev --non-interactive --agree-tos -m danganhtuongg@gmail.com --redirect || true

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 HOÀN TẤT NÂNG CẤP BẢO MẬT THƯƠNG MẠI 100%!                    ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Truy cập ngay: 👉 ${GREEN}https://toeic.danganhtuong.dev${NC}"
