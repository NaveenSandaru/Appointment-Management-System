import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { jwTokens } from '../utils/jwt-helper.js';
import jwt from 'jsonwebtoken';
import {sendAccountCreationInvite} from './../utils/mailer.js';

const prisma = new PrismaClient();
const router = express.Router();

// Create admin
router.post('/', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admins.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await prisma.admins.findMany({
      select: { email: true, name: true }, // hide password
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific admin
router.get('/:email', async (req, res) => {
  try {
    const admin = await prisma.admins.findUnique({
      where: { email: req.params.email },
      select: { email: true, name: true }, // hide password
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an admin
router.put('/:email', async (req, res) => {
  const { name, password } = req.body;
  if (!name && !password) {
    return res.status(400).json({ error: 'At least one field is required to update' });
  }

  try {
    const data = {};
    if (name) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.admins.update({
      where: { email: req.params.email },
      data,
    });
    res.json({ email: updated.email, name: updated.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an admin
router.delete('/:email', async (req, res) => {
  try {
    await prisma.admins.delete({
      where: { email: req.params.email },
    });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Admin not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/sendEmail', async (req, res) => {
  try{
    const {email, role, link} = req.body;
    await sendAccountCreationInvite(email, role, link);
    res.status(201).json({message:"Invitation sent"});
  }
  catch(err){
    console.log(err.message);
    res.status(500).json({error:err.message});
  }
})

export default router;
