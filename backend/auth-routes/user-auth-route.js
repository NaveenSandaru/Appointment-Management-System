import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwTokens } from '../utils/jwt-helper.js';
import prisma from '../prismaClient.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        let user = null;
        let role = '';
        const { email, password, checked } = req.body;
        
        // Use raw query to bypass tenant middleware during login
        const clientResults = await prisma.$queryRaw`
            SELECT email, name, password, tenant_id FROM clients WHERE email = ${email}
        `;
        
        if (clientResults && clientResults.length > 0) {
            user = clientResults[0];
            role = "client";
        } else {
            // Check admin table
            const adminResults = await prisma.$queryRaw`
                SELECT email, name, password, tenant_id FROM admins WHERE email = ${email}
            `;
            
            if (adminResults && adminResults.length > 0) {
                user = adminResults[0];
                role = "admin";
            }
        }
        
        if (!user) {
            return res.json({ successful: false, message: 'User not found' });
        }
        
        if(!user.password){
            return res.json({ successful: false, message: 'Invalid password' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ successful: false, message: 'Invalid password' });
        }

        // Check if email is verified by checking if a verification record exists
        const verificationRecord = await prisma.$queryRaw`
            SELECT email FROM email_verification WHERE email = ${user.email}
        `;

        // If a verification record exists, the email is not verified yet
        if (verificationRecord && verificationRecord.length > 0) {
            return res.json({
                successful: false,
                message: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email
            });
        }

        const tokens = jwTokens(user.email, user.name, role, user.tenant_id);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: checked ? 14 * 24 * 60 * 60 * 1000 : undefined,
          });
          
        console.log("Log in successfull as a" + role); 
        return res.json({
            successful: true,
            message: 'Login successful',
            accessToken: tokens.accessToken,
            user: {
                email: user.email,
                name: user.name,
                role: role,
                tenant_id: user.tenant_id
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

router.post('/google_login', async (req, res) => {
    try {
        const role = "client";
        const { email, name, ...rest } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        let user = await prisma.clients.findUnique({ where: { email } });
        if(user && user.password){
            return res.status(500).json({ message: 'Account Already Exists. Login with credentials' });
        }

        if (!user) {
            user = await prisma.clients.create({
                data: {
                    email,
                    name,
                    phone_number: '',
                    password: null,
                    ...rest
                }
            });
        } else {
            // Update existing user info
            user = await prisma.clients.update({
                where: { email },
                data: {
                    name,
                    ...rest
                }
            });
        }

        // Generate tokens
        const tokens = jwTokens(user.email, user.name, role);
        console.log("Google log in success");

        // Set refresh token in cookie (session cookie)
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: undefined
        });

        return res.json({
            successful: true,
            message: 'Login successful',
            accessToken: tokens.accessToken,
            user: {
                email: user.email,
                name: user.name,
                role: role
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin_login', async (req, res) => {
    try {
        const { email, password, checked } = req.body;
        
        // Use raw query to bypass tenant middleware during login
        const adminResults = await prisma.$queryRaw`
            SELECT email, name, password, tenant_id FROM admins WHERE email = ${email}
        `;
        
        if (!adminResults || adminResults.length === 0) {
            return res.json({ successful: false, message: 'Invalid credentials' });
        }
        
        const admin = adminResults[0];
        
        if (!admin.password) {
            return res.json({ successful: false, message: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.json({ successful: false, message: 'Invalid credentials' });
        }

        // Check if email is verified by checking if a verification record exists
        const verificationRecord = await prisma.$queryRaw`
            SELECT email FROM email_verification WHERE email = ${admin.email}
        `;

        // If a verification record exists, the email is not verified yet
        if (verificationRecord && verificationRecord.length > 0) {
            return res.json({
                successful: false,
                message: 'Please verify your email before logging in',
                needsVerification: true,
                email: admin.email
            });
        }

        const tokens = jwTokens(admin.email, admin.name, "admin", admin.tenant_id);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: checked ? 14 * 24 * 60 * 60 * 1000 : undefined,
        });

        return res.json({
            successful: true,
            message: 'Login successful',
            accessToken: tokens.accessToken,
            user: {
                email: admin.email,
                name: admin.name,
                role: 'admin',
                tenant_id: admin.tenant_id
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: err.message });
    }
});
  


router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.json(false);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (error, user) => {
            if (error) return res.status(403).json({ error: error.message });

            const { email, name, role, tenant_id } = user;
            const accessToken = jwt.sign({ email, name, role, tenant_id }, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: '15m',
            });

            res.json({ 
                accessToken, 
                user: {
                    email: user.email, 
                    name: user.name, 
                    role: user.role,
                    tenant_id: user.tenant_id
                } 
            });
        });
    } catch (err) {
        console.error(err.message);
        return res.json(false);
    }
});

// DELETE /auth/refresh_token
router.delete('/delete_token', (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
          });
          
        return res.status(200).json({ message: 'Refresh token deleted' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

export default router;
