import express from 'express';
import { PrismaClient } from '@prisma/client';
import {authenticateToken} from './../middleware/authentication.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const { email, name, phone_number, profile_picture, age, gender, address, password } = req.body.datatosendtoclient;
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
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a client
router.put('/', /*authenticateToken*/ async (req, res) => {
  const { email, profile_picture: newProfilePicture } = req.body;

  try {
    // Step 1: Get existing client
    const existingClient = await prisma.clients.findUnique({ where: { email } });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Step 2: If new profile picture is different, delete the old one
    const oldProfilePicture = existingClient.profile_picture;

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

    // Step 3: Update the client
    const updatedClient = await prisma.clients.update({
      where: { email },
      data: req.body,
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



// DELETE client and profile picture
router.delete('/', /*authenticateToken*/ async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Find the client
    const client = await prisma.clients.findUnique({ where: { email } });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Step 2: Delete the profile picture if it exists
    if (client.profile_picture) {
      const imagePath = path.join(__dirname, '..', client.profile_picture); // Adjust as needed
      console.log('Attempting to delete:', imagePath);


      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting profile picture:', err.message);
        } else {
          console.log('Profile picture deleted:', client.profile_picture);
        }
      });
    }

    // Step 3: Delete the client record
    await prisma.clients.delete({ where: { email } });

    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



export default router;
