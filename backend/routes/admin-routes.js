import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import { jwTokens } from '../utils/jwt-helper.js';
import jwt from 'jsonwebtoken';
import {sendAccountCreationInvite} from './../utils/mailer.js';
import { authenticateToken, authenticateTokenWithTenant } from './../middleware/authentication.js';
import { randomUUID } from 'crypto';


const router = express.Router();

// Create admin - unused(no tennant)
router.post('/', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const aid = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admins.create({
      data: {
        aid: aid,
        email,
        name,
        password: hashedPassword,
      },
    });
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all admins
router.get('/', authenticateTokenWithTenant, async (req, res) => {
  try {
    // Only allow admin access
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin access required.' });
    }
    
    const admins = await prisma.admins.findMany({
      select: { email: true, name: true, tenant_id: true }, // hide password
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific admin
router.get('/:email', authenticateTokenWithTenant, async (req, res) => {
  try {
    // Only allow admin access
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin access required.' });
    }
    
    const admin = await prisma.admins.findUnique({
      where: { email: req.params.email },
      select: { email: true, name: true, tenant_id: true }, // hide password
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an admin
router.put('/:email', async (req, res) => {
  const { name, password } = req.body;
  if (!name && !password) {
    return res.status(400).json({ error: 'At least one field is required to update' });
  }

  try {
    const data = {};
    if (name) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.admins.update({
      where: { email: req.params.email },
      data,
    });
    res.json({ email: updated.email, name: updated.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an admin
router.delete('/:email', async (req, res) => {
  try {
    await prisma.admins.delete({
      where: { email: req.params.email },
    });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Admin not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get admin profile with tenant information
router.get('/profile/:email', authenticateTokenWithTenant, async (req, res) => {
  const { email } = req.params;
  
  try {
    // Only allow admin access or access to their own profile
    if (req.user?.role !== 'admin' && req.user?.email !== email) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const admin = await prisma.admins.findUnique({
      where: { email },
      select: {
        email: true,
        name: true,
        tenant_id: true,
        tenant: {
          select: {
            name: true,
            display_name: true,
            domain: true,
            logo_url: true,
            is_active: true
          }
        }
      },
      skipTenantEnforcement: true
    });
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Structure the response to include tenant information clearly
    const profileData = {
      email: admin.email,
      name: admin.name,
      tenant_id: admin.tenant_id,
      tenant_name: admin.tenant?.display_name || admin.tenant?.name || 'No tenant assigned',
      tenant_domain: admin.tenant?.domain,
      tenant_logo: admin.tenant?.logo_url,
      tenant_is_active: admin.tenant?.is_active
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Admin profile fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update admin profile
router.put('/profile/:email', authenticateTokenWithTenant, async (req, res) => {
  const { email } = req.params;
  const { name, password } = req.body;
  
  try {
    // Only allow admin to update their own profile
    if (req.user?.email !== email) {
      return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    }
    
    const updateData = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedAdmin = await prisma.admins.update({
      where: { email },
      data: updateData,
      select: {
        email: true,
        name: true,
        tenant_id: true,
        tenant: {
          select: {
            name: true,
            display_name: true,
            domain: true,
            logo_url: true,
            is_active: true
          }
        }
      },
      skipTenantEnforcement: true
    });
    
    const profileData = {
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      tenant_id: updatedAdmin.tenant_id,
      tenant_name: updatedAdmin.tenant?.display_name || updatedAdmin.tenant?.name || 'No tenant assigned',
      tenant_domain: updatedAdmin.tenant?.domain,
      tenant_logo: updatedAdmin.tenant?.logo_url,
      tenant_is_active: updatedAdmin.tenant?.is_active
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Admin profile update error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/sendEmail', authenticateTokenWithTenant, async (req, res) => {
  try{
    const {email, role, link} = req.body;
    
    // Get the admin's tenant information for client invitations
    if (role === 'client' && req.tenantId) {
      // Get tenant information
      const tenant = await prisma.tenants.findUnique({
        where: { tennat_id: req.tenantId },
        select: { tennat_id: true, name: true, display_name: true }
      });
      
      if (tenant) {
        await sendAccountCreationInvite(email, role, link, tenant);
      } else {
        await sendAccountCreationInvite(email, role, link);
      }
    } else {
      await sendAccountCreationInvite(email, role, link);
    }
    
    res.status(201).json({message:"Invitation sent"});
  }
  catch(err){
    console.log(err.message);
    res.status(500).json({error:err.message});
  }
})

export default router;
