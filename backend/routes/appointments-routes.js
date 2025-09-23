import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken, authenticateTokenWithTenant } from './../middleware/authentication.js'
import { sendAppointmentConfirmation, sendAppointmentCancelation } from '../utils/mailer.js';

const router = express.Router();

// Get all appointments
router.get('/', authenticateTokenWithTenant, async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany({
      tenantId: req.tenantId
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by ID
router.get('/appointment', authenticateTokenWithTenant, async (req, res) => {
  const { appointment_id } = req.body;
  try {
    const appointment = await prisma.appointments.findUnique({ 
      where: { appointment_id },
      tenantId: req.tenantId
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments by service ID with client info
router.get('/service/:service_id', authenticateTokenWithTenant, async (req, res) => {
  const { service_id } = req.params;

  try {
    // First validate that the service belongs to the user's tenant
    const service = await prisma.services.findFirst({
      where: {
        service_id: service_id,
        tenant_id: req.tenantId
      },
      skipTenantEnforcement: true
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or access denied' });
    }

    const appointments = await prisma.appointments.findMany({
      where: { 
        service_id,
        tenant_id: req.tenantId  // Explicit tenant filtering
      },
      include: {
        clients: {
          select: {
            name: true,
            profile_picture: true,
          },
        },
        services: {
          select: {
            service_name: true,
            service_type: true,
          },
        },
      },
      skipTenantEnforcement: true
    });

    if (!appointments || appointments.length === 0) {
      return res.status(205).json({ error: 'No appointments found' });
    }

    // Enrich response with clientName and clientImageUrl
    const enriched = appointments.map((appt) => ({
      ...appt,
      clientName: appt.clients?.name,
      clientImageUrl: appt.clients?.profile_picture,
      serviceName: appt.services?.service_name,
      serviceType: appt.services?.service_type,
    }));

    console.log(`Appointments for service ${service_id} in tenant ${req.tenantId}:`, enriched.length);
    res.json(enriched);
  } catch (err) {
    console.error('Service appointments error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/client/:client_email', authenticateTokenWithTenant, async (req, res) => {
  const { client_email } = req.params;
  try {
    const appointment = await prisma.appointments.findMany({ 
      where: { 
        client_email,
        tenant_id: req.tenantId
      },
      skipTenantEnforcement: true
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new appointment
router.post('/', authenticateTokenWithTenant, async (req, res) => {
  const {
    client_email,
    service_id,
    date,
    time_from,
    time_to,
    note
  } = req.body;

  if (!service_id || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const appointment = await prisma.appointments.create({
      data: {
        client_email,
        service_id,
        date,
        time_from,
        time_to,
        note
      },
      tenantId: req.tenantId
    });
   
    if(client_email){
      sendAppointmentConfirmation(client_email, date, time_from);
    }
    res.status(201).json(appointment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:appointment_id', authenticateTokenWithTenant, async (req, res) => {
  const { appointment_id } = req.params;
  const updateData = req.body;

  try {
    const updated = await prisma.appointments.update({
      where: { appointment_id },
      data: updateData,
      tenantId: req.tenantId
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Appointment not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete appointment
router.delete('/:appointment_id', authenticateTokenWithTenant, async (req, res) => {
  const { appointment_id } = req.params;

  try {
    const appointment = await prisma.appointments.findUnique({
      where: { appointment_id },
      tenantId: req.tenantId,
      include: {
        services: {
          select: {
            service_name: true,
          },
        },
      },
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await prisma.appointments.delete({ 
      where: { appointment_id },
      tenantId: req.tenantId
    });
    
    if(appointment.client_email && appointment.services) {
      sendAppointmentCancelation(
        appointment.client_email,
        appointment.date,
        appointment.time_from,
        appointment.services.service_name
      );
    }
    
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Appointment not found' });
    } else {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
});


export default router;
