import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateWithAutoTenant } from '../middleware/authentication.js';

const router = express.Router();

// Get all tenants (for admin use or signup selection)
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenants.findMany({
      where: { is_active: true },
      select: {
        tenant_id: true,
        name: true,
        display_name: true,
        domain: true,
        logo_url: true
      }
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user's tenant information
router.get('/current', authenticateWithAutoTenant, async (req, res) => {
  try {
    const tenant = await prisma.tenants.findUnique({
      where: { tenant_id: req.tenantId },
      select: {
        tenant_id: true,
        name: true,
        display_name: true,
        domain: true,
        logo_url: true
      }
    });
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new tenant (admin only)
router.post('/', async (req, res) => {
  const { name, display_name, domain, logo_url } = req.body;
  
  if (!name || !display_name) {
    return res.status(400).json({ error: 'Name and display_name are required' });
  }
  
  try {
    const tenant = await prisma.tenants.create({
      data: {
        name,
        display_name,
        domain,
        logo_url
      }
    });
    
    res.status(201).json(tenant);
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Domain already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update tenant
router.put('/:tenant_id', authenticateWithAutoTenant, async (req, res) => {
  const { tenant_id } = req.params;
  const updateData = req.body;
  
  // Users can only update their own tenant
  if (tenant_id !== req.tenantId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const tenant = await prisma.tenants.update({
      where: { tenant_id },
      data: updateData
    });
    
    res.json(tenant);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Tenant not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;