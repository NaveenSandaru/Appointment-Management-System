import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant } from './../middleware/authentication.js'


const router = express.Router();

// Get all questions for all clients
router.get('/', authenticateTokenWithTenant, async (req, res) => {
  try {
    const answers = await prisma.client_user_questions.findMany();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions for a specific client
router.get('/:email', authenticateTokenWithTenant, async (req, res) => {
  const { email } = req.params;
  
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Tenant ID missing' });
  }
  
  try {
    // First find the client to get their client_id
    const client = await prisma.clients.findFirst({
      where: { email, tenant_id: req.tenantId },
      select: { client_id: true },
      skipTenantEnforcement: true
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const answers = await prisma.client_user_questions.findMany({
      where: { 
        client_id: client.client_id, 
        tenant_id: req.tenantId 
      },
      include: {
        security_questions: true
      },
      skipTenantEnforcement: true
    });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a specific answer
router.post('/', async (req, res) => {
  const { email, answers } = req.body;

  if (!email || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Email and answers array are required' });
  }

  try {
    // First, find the client by email to get client_id and tenant_id
    const client = await prisma.clients.findUnique({
      where: { email },
      select: { client_id: true, tenant_id: true },
      skipTenantEnforcement: true
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.tenant_id) {
      return res.status(400).json({ error: 'Client has no associated tenant' });
    }

    const results = await Promise.all(
      answers.map(({ question_id, answer }) => {
        if (!question_id || !answer) {
          throw new Error("Missing question_id or answer in one of the items");
        }
        return prisma.client_user_questions.upsert({
          where: {
            question_id_client_id_tenant_id: { 
              question_id, 
              client_id: client.client_id, 
              tenant_id: client.tenant_id 
            },
          },
          update: { answer },
          create: { 
            question_id, 
            answer, 
            client_id: client.client_id, 
            tenant_id: client.tenant_id 
          },
          skipTenantEnforcement: true
        });
      })
    );

    res.status(201).json({ success: true, data: results });
  } catch (err) {
    console.error('Client user questions error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Delete a specific answer
router.delete('/:email/:question_id', authenticateTokenWithTenant, async (req, res) => {
  const { email, question_id } = req.params;
  
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Tenant ID missing' });
  }
  
  try {
    // First find the client to get their client_id
    const client = await prisma.clients.findFirst({
      where: { email, tenant_id: req.tenantId },
      select: { client_id: true },
      skipTenantEnforcement: true
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client_user_questions.delete({
      where: {
        question_id_client_id_tenant_id: { 
          question_id, 
          client_id: client.client_id, 
          tenant_id: req.tenantId 
        }
      },
      skipTenantEnforcement: true
    });
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Answer not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
