import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant, authenticateWithAutoTenant } from './../middleware/authentication.js'


const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.reviews.findMany();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific review
router.get('/:client_email/:service_id/:history_id', authenticateWithAutoTenant, async (req, res) => {
  const { client_email, service_id, history_id } = req.params;
  try {
    // First find the client by email to get client_id
    const client = await prisma.clients.findFirst({
      where: { 
        email: client_email,
        tenant_id: req.tenantId
      },
      select: { client_id: true },
      skipTenantEnforcement: true
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const review = await prisma.reviews.findUnique({
      where: {
        client_id_history_id_service_id_tenant_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a review
router.post('/', authenticateWithAutoTenant, async (req, res) => {
  const { client_email, service_id, history_id, review } = req.body;

  if (!client_email || !service_id || !history_id || !review) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // First find the client by email to get client_id
    const client = await prisma.clients.findFirst({
      where: { 
        email: client_email,
        tenant_id: req.tenantId
      },
      select: { client_id: true },
      skipTenantEnforcement: true
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const upserted = await prisma.reviews.upsert({
      where: {
        client_id_history_id_service_id_tenant_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
      update: { review },
      create: {
        client_id: client.client_id,
        tenant_id: req.tenantId,
        service_id,
        history_id,
        review,
      },
    });
    res.status(201).json(upserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a review
router.delete('/:client_email/:service_id/:history_id', authenticateWithAutoTenant, async (req, res) => {
  const { client_email, service_id, history_id } = req.params;
  try {
    // First find the client by email to get client_id
    const client = await prisma.clients.findFirst({
      where: { 
        email: client_email,
        tenant_id: req.tenantId
      },
      select: { client_id: true },
      skipTenantEnforcement: true
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.reviews.delete({
      where: {
        client_id_history_id_service_id_tenant_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
    });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Review not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
