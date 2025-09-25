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
    // Handle picture - provide default if none is uploaded
    const picture = req.file ? req.file.filename : 'default-service.png';
    
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
// PUBLIC: Get services for public browsing (shows services from all active tenants)
router.get('/public', async (req, res) => {
  try {
    const { active_only } = req.query;
    
    let whereClause = { is_active: true }; // Show active services from all tenants
    
    if (active_only !== 'true') {
      // If not filtering by active only, remove the is_active filter
      delete whereClause.is_active;
    }

    const services = await prisma.services.findMany({
      where: whereClause,
      orderBy: { service_name: 'asc' },
      skipTenantEnforcement: true
    });
    
    console.log(`Public services:`, services.length);
    res.json({ successful: true, data: services });
  } catch (error) {
    console.error('Public services fetch error:', error);
    res.status(500).json({ successful: false, message: error.message });
  }
});

// AUTHENTICATED: Get services for authenticated users (tenant-specific)
router.get('/', authenticateWithAutoTenant, async (req, res) => {
  try {
    const { active_only } = req.query;
    
    // Use tenant_id from authenticated user
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }
    
    let whereClause = { tenant_id: finalTenantId };
    
    if (active_only === 'true') {
      whereClause.is_active = true;
    }
    
    const services = await prisma.services.findMany({
      where: whereClause,
      orderBy: { service_name: 'asc' },
      skipTenantEnforcement: true
    });
    
    console.log(`Services for tenant ${finalTenantId}:`, services.length);
    res.json({ successful: true, data: services });
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ successful: false, message: error.message });
  }
});

// PUBLIC: Get one service by ID for public browsing
router.get('/public/:id', async (req, res) => {
  try {
    const service = await prisma.services.findFirst({
      where: { 
        service_id: req.params.id,
        is_active: true  // Only show active services publicly
      },
      skipTenantEnforcement: true
    });

    if (!service) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    // Check if service tenant matches requested tenant (security check)
    res.json({ successful: true, data: service });
  } catch (error) {
    console.error('Public service fetch error:', error);
    res.status(500).json({ successful: false, message: error.message });
  }
});

// AUTHENTICATED: Get one service by ID for authenticated users
router.get('/:id', authenticateWithAutoTenant, async (req, res) => {
  try {
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }
    
    // Strict tenant isolation: only allow viewing services from user's tenant
    const service = await prisma.services.findFirst({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId
      },
      skipTenantEnforcement: true
    });

    if (!service) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    res.json({ successful: true, data: service });
  } catch (error) {
    console.error('Service fetch error:', error);
    res.status(500).json({ successful: false, message: error.message });
  }
});

// UPDATE a service (including optional new picture)
router.put('/:id', authenticateWithAutoTenant, upload.single('picture'), async (req, res) => {
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
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }

    // Check if service exists and belongs to user's tenant
    const existing = await prisma.services.findFirst({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      skipTenantEnforcement: true
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
    
    // Handle picture - provide default if none provided and none exists
    if (picture) {
      updateData.picture = picture;
    } else if (!existing.picture) {
      // If no new picture is provided and no existing picture, set a default
      updateData.picture = 'default-service.png'; // You can customize this default image name
    }
    // If no new picture but existing picture exists, keep the existing one (don't change updateData.picture)

    const updated = await prisma.services.update({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      data: updateData,
      skipTenantEnforcement: true
    });

    res.json({ successful: true, data: updated });
  } catch (error) {
    console.error('Service update error:', error);
    res.status(400).json({ successful: false, message: error.message });
  }
});

// DELETE a service (and its picture)
router.delete('/:id', authenticateWithAutoTenant, async (req, res) => {
  try {
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }

    // Check if service exists and belongs to user's tenant
    const existing = await prisma.services.findFirst({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      skipTenantEnforcement: true
    });

    if (!existing) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    // Delete picture file if it exists and it's not the default
    if (existing.picture && existing.picture !== 'default-service.png') {
      const filePath = `uploads/services/${existing.picture}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.services.delete({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      skipTenantEnforcement: true
    });

    res.json({ successful: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Service delete error:', error);
    res.status(400).json({ successful: false, message: error.message });
  }
});

// Search services by multiple criteria
router.get('/search/:query', authenticateWithAutoTenant, async (req, res) => {
  try {
    const { query } = req.params;
    const { service_type, location, min_fee, max_fee } = req.query;
    
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }
    
    const whereClause = {
      tenant_id: finalTenantId,  // Enforce tenant isolation
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
      orderBy: { service_name: 'asc' },
      skipTenantEnforcement: true
    });

    console.log(`Search results for tenant ${finalTenantId}:`, services.length);
    res.json({ successful: true, data: services });
  } catch (error) {
    console.error('Service search error:', error);
    res.status(500).json({ successful: false, message: error.message });
  }
});

// Get service statistics
router.get('/stats/overview', authenticateWithAutoTenant, async (req, res) => {
  try {
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }
    
    const tenantFilter = { tenant_id: finalTenantId };
    
    const totalServices = await prisma.services.count({ 
      where: tenantFilter,
      skipTenantEnforcement: true 
    });
    
    const activeServices = await prisma.services.count({ 
      where: { ...tenantFilter, is_active: true },
      skipTenantEnforcement: true 
    });
    
    const serviceTypes = await prisma.services.groupBy({
      by: ['service_type'],
      where: tenantFilter,
      _count: { service_type: true },
      skipTenantEnforcement: true
    });

    const avgFee = await prisma.services.aggregate({
      _avg: { appointment_fee: true },
      where: { ...tenantFilter, is_active: true },
      skipTenantEnforcement: true
    });

    console.log(`Stats for tenant ${finalTenantId}: ${totalServices} total services`);
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
// Toggle service active status
router.patch('/:id/toggle-status', authenticateWithAutoTenant, async (req, res) => {
  try {
    const finalTenantId = req.tenantId;
    
    if (!finalTenantId) {
      return res.status(400).json({ 
        successful: false, 
        message: 'Tenant ID not found. Please log in again.' 
      });
    }

    // Check if service exists and belongs to user's tenant
    const existing = await prisma.services.findFirst({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      skipTenantEnforcement: true
    });

    if (!existing) {
      return res.status(404).json({ successful: false, message: 'Service not found' });
    }

    const updated = await prisma.services.update({
      where: { 
        service_id: req.params.id,
        tenant_id: finalTenantId  // Ensure tenant isolation
      },
      data: { is_active: !existing.is_active },
      skipTenantEnforcement: true
    });

    res.json({ 
      successful: true, 
      data: updated,
      message: `Service ${updated.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Service toggle status error:', error);
    res.status(400).json({ successful: false, message: error.message });
  }
});

export default router;
