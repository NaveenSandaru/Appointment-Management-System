import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/services';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// CREATE a new service with optional picture
router.post('/', upload.single('picture'), async (req, res) => {
  const { 
    service_name, 
    description, 
    service_type, 
    specialization, 
    work_days_from, 
    work_days_to, 
    work_hours_from, 
    work_hours_to, 
    appointment_duration, 
    appointment_fee, 
    language,
    is_active = true 
  } = req.body;

  try {
    const picture = req.file ? req.file.filename : null;
    
    const created = await prisma.services.create({
      data: {
        service_name,
        picture,
        description,
        service_type,
        specialization,
        work_days_from,
        work_days_to,
        work_hours_from,
        work_hours_to,
        appointment_duration,
        appointment_fee: parseInt(appointment_fee),
        language,
        is_active: Boolean(is_active)
      }
    });
    res.status(201).json({ successful: true, data: created });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

// READ all services
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    const whereClause = active_only === 'true' ? { is_active: true } : {};
    
    const services = await prisma.services.findMany({
      where: whereClause,
      orderBy: { service_name: 'asc' }
    });
    res.json({ successful: true, data: services });
  } catch (error) {
    res.status(500).json({ successful: false, message: error.message });
  }
});

// READ one service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.services.findUnique({
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

// UPDATE a service (including optional new picture)
router.put('/:id', upload.single('picture'), async (req, res) => {
  const { 
    service_name, 
    description, 
    service_type, 
    specialization, 
    work_days_from, 
    work_days_to, 
    work_hours_from, 
    work_hours_to, 
    appointment_duration, 
    appointment_fee, 
    language,
    is_active 
  } = req.body;
  const picture = req.file ? req.file.filename : undefined;

  try {
    const existing = await prisma.services.findUnique({
      where: { service_id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    // Optional: delete old picture file
    if (picture && existing.picture) {
      const oldPath = `uploads/services/${existing.picture}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updateData = {
      service_name,
      description,
      service_type,
      specialization,
      work_days_from,
      work_days_to,
      work_hours_from,
      work_hours_to,
      appointment_duration,
      language
    };

    if (appointment_fee !== undefined) updateData.appointment_fee = parseInt(appointment_fee);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (picture) updateData.picture = picture;

    const updated = await prisma.services.update({
      where: { service_id: req.params.id },
      data: updateData
    });

    res.json({ successful: true, data: updated });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

// DELETE a service (and its picture)
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.services.findUnique({
      where: { service_id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    // Delete picture file
    if (existing.picture) {
      const filePath = `uploads/services/${existing.picture}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.services.delete({
      where: { service_id: req.params.id }
    });

    res.json({ successful: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

export default router;
