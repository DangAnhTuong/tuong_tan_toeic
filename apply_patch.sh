#!/usr/bin/env bash
# ==============================================================================
#   TUONG TAN TOEIC — 1-TOUCH COMMERCIAL SECURITY & AUTH PATCH
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}  🎧 TƯỜNG TẬN TOEIC — BẢN VÁ BẢO MẬT THƯƠNG MẠI CHUẨN ĐẬU TOEIC  ${NC}"
echo -e "${BLUE}================================================================${NC}"

APP_DIR="/var/www/tuong-tan-toeic"

# 1. Update backend files
echo -e "\n${YELLOW}1/6. Cập nhật mã nguồn Backend (Xác thực Google OIDC & CORS)...${NC}"
cp -f /root/patch_files/backend/src/app.js "$APP_DIR/backend/src/app.js"
cp -f /root/patch_files/backend/src/controllers/auth.controller.js "$APP_DIR/backend/src/controllers/auth.controller.js"
cp -f /root/patch_files/backend/src/middleware/rateLimiter.js "$APP_DIR/backend/src/middleware/rateLimiter.js"
cp -f /root/patch_files/backend/package.json "$APP_DIR/backend/package.json"

# 2. Install google-auth-library on VPS backend
echo -e "\n${YELLOW}2/6. Cài đặt thư viện xác thực chữ ký số google-auth-library...${NC}"
cd "$APP_DIR/backend"
npm install --production --no-audit --no-fund google-auth-library

# 3. Update backend .env
echo -e "\n${YELLOW}3/6. Chuẩn hóa biến môi trường sản xuất (.env)...${NC}"
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://toeic.danganhtuong.dev,http://toeic.danganhtuong.dev,https://danganhtuong.dev,http://danganhtuong.dev,http://116.118.3.69,http://localhost:3000|' "$APP_DIR/backend/.env"
if ! grep -q "GOOGLE_CLIENT_ID=" "$APP_DIR/backend/.env"; then
  echo "GOOGLE_CLIENT_ID=151027052858-mmdiucsj3s8ddkmfk0rieanmhojts1np.apps.googleusercontent.com" >> "$APP_DIR/backend/.env"
fi

# 4. Update frontend dist
echo -e "\n${YELLOW}4/6. Cập nhật giao diện Frontend (Xóa nút test, tích hợp Google OIDC)...${NC}"
cp -rf /root/patch_files/frontend/dist/* "$APP_DIR/frontend/dist/"

# 5. Restart PM2 Backend
echo -e "\n${YELLOW}5/6. Khởi động lại Backend PM2...${NC}"
pm2 restart tuong-tan-toeic-api || pm2 start "$APP_DIR/backend/ecosystem.config.js" --env production
pm2 save

# 6. Configure Nginx & SSL
echo -e "\n${YELLOW}6/6. Kích hoạt Nginx & Chứng chỉ bảo mật HTTPS SSL Let's Encrypt...${NC}"
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

# Issue Let's Encrypt SSL
certbot --nginx -d toeic.danganhtuong.dev --non-interactive --agree-tos -m danganhtuongg@gmail.com --redirect || true

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 BẢN VÁ BẢO MẬT THƯƠNG MẠI ĐÃ ĐƯỢC ÁP DỤNG THÀNH CÔNG 100%!     ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Hệ thống đã đạt chuẩn bảo mật thương mại như Đậu TOEIC."
echo -e "Truy cập ngay: 👉 ${GREEN}https://toeic.danganhtuong.dev${NC}"
