import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant, authenticateWithAutoTenant } from './../middleware/authentication.js'


const router = express.Router();

// Get all security questions
router.get('/', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const finalTenantId = tenant_id || req.tenantId || 'default-tenant';
    
    const questions = await prisma.security_questions.findMany({
      where: { tenant_id: finalTenantId },
      orderBy: { question_id: 'asc' },
      skipTenantEnforcement: true
    });
    res.json({ successful: true, data: questions });
  } catch (err) {
    res.status(500).json({ successful: false, error: err.message });
  }
});

// Get a specific security question
router.get('/:question_id', async (req, res) => {
  const { question_id } = req.params;
  const { tenant_id } = req.query;
  const finalTenantId = tenant_id || req.tenantId || 'default-tenant';
  
  try {
    const question = await prisma.security_questions.findUnique({
      where: { question_id },
      skipTenantEnforcement: true
    });
    
    if (!question || question.tenant_id !== finalTenantId) {
      return res.status(404).json({ successful: false, error: 'Security question not found' });
    }
    
    res.json({ successful: true, data: question });
  } catch (err) {
    res.status(500).json({ successful: false, error: err.message });
  }
});

// Create a new security question (admin only)
router.post('/', authenticateWithAutoTenant, async (req, res) => {
  const { question_id, question } = req.body;

  if (!question_id || !question) {
    return res.status(400).json({ successful: false, error: 'Question ID and question text are required' });
  }

  try {
    const newQuestion = await prisma.security_questions.create({
      data: { question_id, question }
    });
    res.status(201).json({ successful: true, data: newQuestion });
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ successful: false, error: 'Question ID already exists' });
    } else {
      res.status(500).json({ successful: false, error: err.message });
    }
  }
});

// Update a security question (admin only)
router.put('/:question_id', authenticateWithAutoTenant, async (req, res) => {
  const { question_id } = req.params;
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ successful: false, error: 'Question text is required' });
  }

  try {
    const updatedQuestion = await prisma.security_questions.update({
      where: { question_id },
      data: { question }
    });
    res.json({ successful: true, data: updatedQuestion });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ successful: false, error: 'Security question not found' });
    } else {
      res.status(500).json({ successful: false, error: err.message });
    }
  }
});

// Delete a security question (admin only)
router.delete('/:question_id', authenticateWithAutoTenant, async (req, res) => {
  const { question_id } = req.params;

  try {
    await prisma.security_questions.delete({
      where: { question_id }
    });
    res.json({ successful: true, message: 'Security question deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ successful: false, error: 'Security question not found' });
    } else {
      res.status(500).json({ successful: false, error: err.message });
    }
  }
});

export default router;