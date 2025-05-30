import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './../middleware/authentication.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to convert "8:00" -> "1970-01-01T08:00:00.000Z"
const convertToISOTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  const date = new Date(Date.UTC(1970, 0, 1, parseInt(hours), parseInt(minutes)));
  return date.toISOString();
};

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
  let {
    email, name, company_phone_number, profile_picture,
    company_address, password, language, service_type,
    specialization, work_days_from, work_days_to,
    work_hours_from, work_hours_to, appointment_duration, company_name
  } = req.body.dataToSend;

  password = await bcrypt.hash(password, 10);

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
        work_hours_from: convertToISOTime(work_hours_from),
        work_hours_to: convertToISOTime(work_hours_to),
        appointment_duration,
        company_name
      }
    });
    res.status(201).json(newProvider);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a service provider
router.put('/', /*authenticateToken*/ async (req, res) => {
  const { email, profile_picture: newProfilePicture } = req.body;

  try {
    const existingProvider = await prisma.service_providers.findUnique({ where: { email } });

    if (!existingProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    const oldProfilePicture = existingProvider.profile_picture;

    if (oldProfilePicture && newProfilePicture && oldProfilePicture !== newProfilePicture) {
      const filename = path.basename(oldProfilePicture);
      const imagePath = path.join(__dirname, '..', filename);

      try {
        await fs.promises.unlink(imagePath);
        console.log('Old profile picture deleted:', filename);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('Error deleting old profile picture:', err.message);
        } else {
          console.log('Old profile picture not found (already deleted).');
        }
      }
    }

    const updateData = { ...req.body };
    if (updateData.work_hours_from) {
      updateData.work_hours_from = convertToISOTime(updateData.work_hours_from);
    }
    if (updateData.work_hours_to) {
      updateData.work_hours_to = convertToISOTime(updateData.work_hours_to);
    }

    const updated = await prisma.service_providers.update({
      where: { email },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Service provider not found' });
    } else {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete a service provider
router.delete('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  try {
    const provider = await prisma.service_providers.findUnique({ where: { email } });

    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    if (provider.profile_picture) {
      const imagePath = path.join(__dirname, '..', provider.profile_picture);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting profile picture:', err.message);
        } else {
          console.log('Profile picture deleted:', provider.profile_picture);
        }
      });
    }

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
