import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant, authenticateWithAutoTenant } from './../middleware/authentication.js'


const router = express.Router();

// Get all ratings
router.get('/', authenticateWithAutoTenant, async (req, res) => {
  try {
    const ratings = await prisma.ratings.findMany();
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific rating
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

    const rating = await prisma.ratings.findUnique({
      where: {
        client_id_tenant_id_service_id_history_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
    });
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a rating
router.post('/', authenticateWithAutoTenant, async (req, res) => {
  const { client_email, service_id, history_id, rating } = req.body;

  if (!client_email || !service_id || !history_id || rating === undefined) {
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

    const upserted = await prisma.ratings.upsert({
      where: {
        client_id_tenant_id_service_id_history_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
      update: { rating },
      create: {
        client_id: client.client_id,
        tenant_id: req.tenantId,
        service_id,
        history_id,
        rating,
      },
    });
    res.status(201).json(upserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a rating
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

    await prisma.ratings.delete({
      where: {
        client_id_tenant_id_service_id_history_id: {
          client_id: client.client_id,
          tenant_id: req.tenantId,
          service_id,
          history_id,
        },
      },
    });
    res.json({ message: 'Rating deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Rating not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
