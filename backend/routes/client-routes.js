import express from 'express';
import { PrismaClient } from '@prisma/client';
import {authenticateToken} from './../middleware/authentication.js'

const prisma = new PrismaClient();
const router = express.Router();

// Get all clients
router.get('/', /*authenticateToken*/ async (req, res) => {
  try {
    const clients = await prisma.clients.findMany();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get client by email
router.get('/client', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  try {
    const client = await prisma.clients.findUnique({ where: { email } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new client
router.post('/', /*authenticateToken*/ async (req, res) => {
  const { email, name, phone_number, profile_picture, age, gender, address, password } = req.body;

  if (!email || !name || !phone_number || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newClient = await prisma.clients.create({
      data: {
        email,
        name,
        phone_number,
        profile_picture,
        age,
        gender,
        address,
        password
      }
    });
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a client
router.put('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  const updateData = req.body;

  try {
    const updatedClient = await prisma.clients.update({
      where: { email },
      data: updateData
    });
    res.json(updatedClient);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete a client
router.delete('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;
  try {
    await prisma.clients.delete({ where: { email } });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
