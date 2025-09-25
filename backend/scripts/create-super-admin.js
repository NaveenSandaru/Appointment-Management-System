import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createSuperAdmin() {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await prisma.super_admin.findFirst();
        
        if (existingSuperAdmin) {
            console.log('Super admin already exists:', existingSuperAdmin.super_admin);
            return;
        }

        // Create super admin
        const username = 'superadmin';
        const password = 'SuperAdmin123!'; // Change this to a secure password
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const superAdmin = await prisma.super_admin.create({
            data: {
                said: crypto.randomUUID(),
                super_admin: username,
                password: hashedPassword
            }
        });

        console.log('Super admin created successfully!');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('ID:', superAdmin.said);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();