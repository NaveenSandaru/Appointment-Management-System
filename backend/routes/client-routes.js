import express from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { authenticateToken, authenticateTokenWithTenant } from './../middleware/authentication.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
router.get('/client/:email', /*authenticateToken*/ async (req, res) => {
  const { email } = req.params;
  try {
    const client = await prisma.clients.findUnique({ where: { email } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new client
router.post('/', async (req, res) => {
  let { email, name, phone_number, profile_picture, age, gender, address, password, tenant_id } = req.body.datatosendtoclient;

  if (!email || !name || !phone_number || !password || !tenant_id) {
    return res.status(400).json({ error: 'Missing required fields: email, name, phone_number, password, and tenant_id are required' });
  }

  try {
    // Verify that the tenant exists and is active
    const tenant = await prisma.tenants.findUnique({
      where: { tenant_id, is_active: true }
    });
    
    if (!tenant) {
      return res.status(400).json({ error: 'Invalid or inactive tenant' });
    }

    // Check if user exists in clients (use raw query to bypass tenant middleware)
    const existingClient = await prisma.$queryRaw`
      SELECT email FROM clients WHERE email = ${email}
    `;

    if (existingClient && existingClient.length > 0) {
      return res.status(409).json({ error: 'Email already in use by another account' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new client with tenant_id using raw query to bypass middleware during registration
    const result = await prisma.$queryRaw`
      INSERT INTO clients (email, name, phone_number, profile_picture, age, gender, address, password, tenant_id)
      VALUES (${email}, ${name}, ${phone_number}, ${profile_picture}, ${age}, ${gender}, ${address}, ${hashedPassword}, ${tenant_id})
      RETURNING email, name, phone_number, profile_picture, age, gender, address, tenant_id
    `;

    return res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a client
router.put('/', /*authenticateToken*/ async (req, res) => {
  const { email, profile_picture: newProfilePicture, password: rawPassword, ...rest } = req.body;

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

    // Step 3: Prepare update data
    const updateData = {
      ...rest,
      ...(newProfilePicture && { profile_picture: newProfilePicture }),
      ...(rawPassword && { password: await bcrypt.hash(rawPassword, 10) }),
    };

    // Step 4: Update the client
    const updatedClient = await prisma.clients.update({
      where: { email },
      data: updateData,
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
