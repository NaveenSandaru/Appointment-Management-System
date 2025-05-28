import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwTokens } from '../utils/jwt-helper.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, checked } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({ successful: false, message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ successful: false, message: 'Invalid password' });
        }

        // Check if email is verified by checking if a verification record exists
        const verificationRecord = await prisma.email_verifications.findUnique({
            where: { email: user.email }
        });

        // If a verification record exists, the email is not verified yet
        if (verificationRecord) {
            return res.json({ 
                successful: false, 
                message: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email
            });
        }

        const tokens = jwTokens(user.email, user.name);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            ...(checked && { maxAge: 14 * 24 * 60 * 60 * 1000 }), // 14 days if remembered
        });

        return res.json({ 
            successful: true, 
            message: 'Login successful',
            accessToken: tokens.accessToken,
            user: {
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// GET /auth/refresh_token
router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.json(false);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (error, user) => {
            if (error) return res.status(403).json({ error: error.message });

            const { email, name } = user;
            const accessToken = jwt.sign({ email, name }, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: '15m',
            });

            res.json({ accessToken, email });
        });
    } catch (err) {
        console.error(err.message);
        return res.json(false);
    }
});

// DELETE /auth/refresh_token
router.delete('/delete_token', (req, res) => {
    try {
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Refresh token deleted' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// GET /user - list all users
router.get('/user', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                name: true,
                email: true,
                phoneNumber: true,
            },
        });

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
