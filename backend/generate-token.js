import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const user = {
  email: 'bob@example.com',
  name: 'Bob Silva',
  role: 'client',
  tenant_id: 'tenant_001'
};

const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });

console.log('🔑 New Access Token:', accessToken);
console.log('🕒 Token expires in 1 hour');
console.log('👤 User:', user);