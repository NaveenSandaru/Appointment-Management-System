import express from 'express';
import { PrismaClient } from '@prisma/client';
import {authenticateToken} from './../middleware/authentication.js'

const prisma = new PrismaClient();
const router = express.Router();

// Get all appointments
router.get('/', /*authenticateToken*/ async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by ID
router.get('/appointment', /*authenticateToken*/ async (req, res) => {
  const { appointment_id } = req.body;
  try {
    const appointment = await prisma.appointments.findUnique({ where: { appointment_id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by service provider email
router.get('/sprovider', /*authenticateToken*/ async (req, res) => {
  const { service_provider_email } = req.body;
  try {
    const appointment = await prisma.appointments.findMany({ where: { service_provider_email } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/client', /*authenticateToken*/ async (req, res) => {
  const { client_email } = req.body;
  try {
    const appointment = await prisma.appointments.findMany({ where: { client_email } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new appointment
router.post('/', /*authenticateToken*/ async (req, res) => {
  const {
    client_email,
    service_provider_email,
    date,
    time_from,
    time_to,
    note
  } = req.body;

  if (!client_email || !service_provider_email || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const appointment = await prisma.appointments.create({
      data: {
        client_email,
        service_provider_email,
        date,
        time_from,
        time_to,
        note
      }
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:appointment_id', /*authenticateToken*/ async (req, res) => {
  const { appointment_id } = req.params;
  const updateData = req.body;

  try {
    const updated = await prisma.appointments.update({
      where: { appointment_id },
      data: updateData
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
router.delete('/', /*authenticateToken*/ async (req, res) => {
  const { appointment_id } = req.body;

  try {
    await prisma.appointments.delete({ where: { appointment_id } });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Appointment not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
