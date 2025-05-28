import express from 'express';
import { PrismaClient } from '@prisma/client';
import {authenticateToken} from './../middleware/authentication.js'

const prisma = new PrismaClient();
const router = express.Router();

// Get all service providers
router.get('/', /*authenticateToken*/ async (req, res) => {
  try {
    const providers = await prisma.service_providers.findMany();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a service provider by email
router.get('/sprovider', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  try {
    const provider = await prisma.service_providers.findUnique({ where: { email } });
    if (!provider) return res.status(404).json({ error: 'Service provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new service provider
router.post('/', /*authenticateToken*/ async (req, res) => {
  const {
    email, name, company_phone_number, profile_picture,
    company_address, password, language, service_type,
    specialization, work_days_from, work_days_to,
    work_hours_from, work_hours_to, appointment_duration, company_name
  } = req.body;

  if (!email || !name || !company_phone_number || !password || !language || !service_type ||
      !work_days_from || !work_days_to || !work_hours_from || !work_hours_to || !appointment_duration || !company_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newProvider = await prisma.service_providers.create({
      data: {
        email,
        name,
        company_phone_number,
        profile_picture,
        company_address,
        password,
        language,
        service_type,
        specialization,
        work_days_from,
        work_days_to,
        work_hours_from,
        work_hours_to,
        appointment_duration,
        company_name
      }
    });
    res.status(201).json(newProvider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a service provider
router.put('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  const updateData = req.body;

  try {
    const updated = await prisma.service_providers.update({
      where: { email },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Service provider not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete a service provider
router.delete('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  try {
    await prisma.service_providers.delete({ where: { email } });
    res.json({ message: 'Service provider deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Service provider not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
