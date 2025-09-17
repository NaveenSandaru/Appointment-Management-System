import express from 'express';
import multer from 'multer';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant, authenticateWithAutoTenant } from './../middleware/authentication.js'
import path from 'path';
import fs from 'fs';

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
router.post('/', authenticateWithAutoTenant, upload.single('picture'), async (req, res) => {
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
    location,
    phone_number,
    email_contact,
    website_url,
    max_advance_booking,
    min_advance_booking,
    cancellation_policy,
    tags,
    capacity,
    requires_preparation,
    is_active = true 
  } = req.body;

  // Input validation
  if (!service_name || !service_type || !work_days_from || !work_days_to || 
      !work_hours_from || !work_hours_to || !appointment_duration || !appointment_fee) {
    return res.status(400).json({ 
      successful: false, 
      message: 'Required fields: service_name, service_type, work_days, work_hours, appointment_duration, appointment_fee' 
    });
  }

  try {
    const picture = req.file ? req.file.filename : null;
    
    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      }
    }
    
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
        location,
        phone_number,
        email_contact,
        website_url,
        max_advance_booking: max_advance_booking ? parseInt(max_advance_booking) : 30,
        min_advance_booking: min_advance_booking ? parseInt(min_advance_booking) : 0,
        cancellation_policy,
        tags: parsedTags,
        capacity: capacity ? parseInt(capacity) : 1,
        requires_preparation: Boolean(requires_preparation),
        is_active: Boolean(is_active),
        tenant_id: req.tenantId
      }
    });
    res.status(201).json({ successful: true, data: created });
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(400).json({ successful: false, message: error.message });
  }
});

// READ all services
router.get('/', authenticateWithAutoTenant, async (req, res) => {
  try {
    const { active_only } = req.query;
    let whereClause = { tenant_id: req.tenantId };
    
    if (active_only === 'true') {
      whereClause.is_active = true;
    }
    
    const services = await prisma.services.findMany({
      where: whereClause,
      orderBy: { service_name: 'asc' }
    });
    res.json({ successful: true, data: services });
  } catch (error) {
    console.error('Services fetch error:', error);
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
    location,
    phone_number,
    email_contact,
    website_url,
    max_advance_booking,
    min_advance_booking,
    cancellation_policy,
    tags,
    capacity,
    requires_preparation,
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

    // Parse tags if provided
    let parsedTags = existing.tags; // Keep existing tags if not provided
    if (tags !== undefined) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      }
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
      language,
      location,
      phone_number,
      email_contact,
      website_url,
      cancellation_policy,
      tags: parsedTags
    };

    // Handle numeric fields
    if (appointment_fee !== undefined) updateData.appointment_fee = parseInt(appointment_fee);
    if (max_advance_booking !== undefined) updateData.max_advance_booking = parseInt(max_advance_booking);
    if (min_advance_booking !== undefined) updateData.min_advance_booking = parseInt(min_advance_booking);
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    
    // Handle boolean fields
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (requires_preparation !== undefined) updateData.requires_preparation = Boolean(requires_preparation);
    
    // Handle picture
    if (picture) updateData.picture = picture;

    const updated = await prisma.services.update({
      where: { service_id: req.params.id },
      data: updateData
    });

    res.json({ successful: true, data: updated });
  } catch (error) {
    console.error('Service update error:', error);
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

// Search services by multiple criteria
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { service_type, location, min_fee, max_fee } = req.query;
    
    const whereClause = {
      is_active: true,
      OR: [
        { service_name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { specialization: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ]
    };

    // Add additional filters
    if (service_type) whereClause.service_type = service_type;
    if (location) whereClause.location = { contains: location, mode: 'insensitive' };
    if (min_fee) whereClause.appointment_fee = { ...whereClause.appointment_fee, gte: parseInt(min_fee) };
    if (max_fee) whereClause.appointment_fee = { ...whereClause.appointment_fee, lte: parseInt(max_fee) };

    const services = await prisma.services.findMany({
      where: whereClause,
      orderBy: { service_name: 'asc' }
    });

    res.json({ successful: true, data: services });
  } catch (error) {
    res.status(500).json({ successful: false, message: error.message });
  }
});

// Get service statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalServices = await prisma.services.count();
    const activeServices = await prisma.services.count({ where: { is_active: true } });
    const serviceTypes = await prisma.services.groupBy({
      by: ['service_type'],
      _count: { service_type: true }
    });

    const avgFee = await prisma.services.aggregate({
      _avg: { appointment_fee: true },
      where: { is_active: true }
    });

    res.json({
      successful: true,
      data: {
        totalServices,
        activeServices,
        inactiveServices: totalServices - activeServices,
        serviceTypes: serviceTypes.map(st => ({
          type: st.service_type,
          count: st._count.service_type
        })),
        averageFee: Math.round(avgFee._avg.appointment_fee || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ successful: false, message: error.message });
  }
});

// Toggle service active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const existing = await prisma.services.findUnique({
      where: { service_id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    const updated = await prisma.services.update({
      where: { service_id: req.params.id },
      data: { is_active: !existing.is_active }
    });

    res.json({ 
      successful: true, 
      data: updated,
      message: `Service ${updated.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
  }
});

export default router;
