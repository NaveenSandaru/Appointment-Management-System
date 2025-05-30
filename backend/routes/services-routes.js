import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// CREATE a new service
router.post('/', async (req, res) => {
  const { service_id, service } = req.body;
  try {
    const created = await prisma.service.create({
      data: {
        service_id,
        service
      }
    });
    res.status(201).json({ successful: true, data: created });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

// READ all services
router.get('/', async (_req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json({ successful: true, data: services });
  } catch (error) {
    res.status(500).json({ successful: false, message: error.message });
  }
});

// READ one service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { service_id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    res.json({ successful: true, data: service });
  } catch (error) {
    res.status(500).json({ successful: false, message: error.message });
  }
});

// UPDATE a service
router.put('/:id', async (req, res) => {
  const { service } = req.body;
  try {
    const updated = await prisma.service.update({
      where: { service_id: req.params.id },
      data: { service }
    });
    res.json({ successful: true, data: updated });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

// DELETE a service
router.delete('/:id', async (req, res) => {
  try {
    await prisma.service.delete({
      where: { service_id: req.params.id }
    });
    res.json({ successful: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

export default router;
