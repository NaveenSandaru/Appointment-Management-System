import express from 'express';
import prisma from '../prismaClient.js';
import { sendVerificationCode } from '../utils/mailer.js';
import { authenticateToken, authenticateTokenWithTenant, authenticateWithAutoTenant } from './../middleware/authentication.js'


const router = express.Router();

router.get('/:email/:tenant_id?', /*authenticateWithAutoTenant,*/ async (req, res) => {
  const { email, tenant_id } = req.params;
  const finalTenantId = tenant_id || 'default-tenant';
  
  try {
    const verification = await prisma.email_verification.findUnique({ 
      where: { email },
      skipTenantEnforcement: true
    });
    if (!verification || verification.tenant_id !== finalTenantId) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    res.json(verification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', /*authenticateWithAutoTenant,*/ async (req, res) => {
  console.log('Email verification POST request body:', req.body);
  const { email, tenant_id } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  // Use default-tenant 
  const finalTenantId = tenant_id || 'default-tenant';

  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    // Use skipTenantEnforcement to bypass middleware and handle tenant manually
    const upsert = await prisma.email_verification.upsert({
      where: { email },
      update: { code },
      create: { email, code, tenant_id: finalTenantId },
      skipTenantEnforcement: true
    });

    await sendVerificationCode(email, code);
    res.status(201).json({ message: 'Code sent', data: upsert });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', /*authenticateWithAutoTenant,*/ async (req, res) => {
  console.log('Email verification VERIFY request body:', req.body);
  const { email, code, tenant_id } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!code) return res.status(400).json({ error: 'Verification code is required' });
  
  // Use default-tenant if no tenant_id is provided
  const finalTenantId = tenant_id || 'default-tenant';
  
  try {
    const record = await prisma.email_verification.findUnique({ 
      where: { email },
      skipTenantEnforcement: true
    });
    
    // Manually check tenant_id and code since we bypassed middleware
    if (!record || record.tenant_id !== finalTenantId || record.code !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await prisma.email_verification.delete({ 
      where: { email },
      skipTenantEnforcement: true
    });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete verification
router.delete('/:email/:tenant_id?', /*authenticateWithAutoTenant,*/ async (req, res) => {
  const { email, tenant_id } = req.params;
  const finalTenantId = tenant_id || 'default-tenant';
  
  try {
    // First check if the record exists and belongs to the correct tenant
    const record = await prisma.email_verification.findUnique({ 
      where: { email },
      skipTenantEnforcement: true
    });
    
    if (!record || record.tenant_id !== finalTenantId) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    
    await prisma.email_verification.delete({ 
      where: { email },
      skipTenantEnforcement: true
    });
    res.json({ message: 'Verification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
