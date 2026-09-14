const { execSync } = require('child_process');

const res = execSync('ssh root@116.118.3.69 "curl -s -i http://127.0.0.1:5000/api/v1/user/profile"').toString();
console.log('--- WITHOUT TOKEN ---');
console.log(res);

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'tuong_tan_toeic_jwt_secret_key_2026_super_secure';
// User ou48187
const token = jwt.sign({ id: '6aa03b01014c03b63216630f', email: 'ou48187@gmail.com', role: 'user', isPro: true }, JWT_SECRET, { expiresIn: '30d' });

const resAuth = execSync(`ssh root@116.118.3.69 "curl -s -i -H 'Authorization: Bearer ${token}' http://127.0.0.1:5000/api/v1/user/profile"`).toString();
console.log('--- WITH AUTH TOKEN ---');
console.log(resAuth);
