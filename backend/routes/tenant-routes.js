import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateTokenWithTenant, authenticateSuperAdmin } from '../middleware/authentication.js';

const router = express.Router();

// Get all tenants (for admin use or signup selection)
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenants.findMany({
      where: { is_active: true },
      select: {
        tennat_id: true,
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
router.get('/current', authenticateTokenWithTenant, async (req, res) => {
  try {
    const tenant = await prisma.tenants.findUnique({
      where: { tennat_id: req.tenantId },
      select: {
        tennat_id: true,
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

// Note: Tenant creation has been moved to super-admin-routes.js
// Only super admins can create tenants

// Update tenant
router.put('/:tenant_id', authenticateTokenWithTenant, async (req, res) => {
  const { tenant_id } = req.params;
  const updateData = req.body;
  
  // Users can only update their own tenant
  if (tenant_id !== req.tenantId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const tenant = await prisma.tenants.update({
      where: { tennat_id: tenant_id },
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