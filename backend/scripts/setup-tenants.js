#!/usr/bin/env node

// Script to setup initial tenants and migrate existing data
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient.js';

async function setupTenantsAndMigrateData() {
  console.log('🔄 Setting up tenants and migrating existing data...\n');

  try {
    // First, let's check what data exists
    console.log('📊 Checking existing data...');
    
    const clientsCount = await prisma.clients.count({ skipTenantEnforcement: true });
    const adminsCount = await prisma.admins.count({ skipTenantEnforcement: true });
    
    console.log(`Found ${clientsCount} clients and ${adminsCount} admins`);

    // Create default tenant if it doesn't exist
    console.log('\n🏢 Creating default tenant...');
    
    const defaultTenantId = '00000000-0000-4000-8000-000000000001'; // Fixed UUID for default tenant
    
    try {
      await prisma.tenants.upsert({
        where: { tennat_id: defaultTenantId },
        update: {},
        create: {
          tennat_id: defaultTenantId,
          name: 'Default Organization',
          display_name: 'Default Organization',
          domain: 'default.com',
          is_active: true
        }
      });
      console.log('✅ Default tenant created/exists');
    } catch (error) {
      console.log('⚠️ Tenant creation error:', error.message);
    }

    // Update existing clients to have default tenant
    console.log('\n👥 Updating existing clients with default tenant...');
    
    const updatedClientsResult = await prisma.$executeRaw`
      UPDATE clients 
      SET tenant_id = ${defaultTenantId}
      WHERE tenant_id IS NULL
    `;
    console.log(`✅ Updated clients: ${updatedClientsResult}`);

    // Update existing admins to have default tenant
    console.log('\n👨‍💼 Updating existing admins with default tenant...');
    
    const updatedAdminsResult = await prisma.$executeRaw`
      UPDATE admins 
      SET tenant_id = ${defaultTenantId}
      WHERE tenant_id IS NULL
    `;
    console.log(`✅ Updated admins: ${updatedAdminsResult}`);

    // Update other tables as needed
    const tableUpdates = [
      'services',
      'appointments', 
      'appointment_history',
      'ratings',
      'reviews',
      'email_verification',
      'security_questions',
      'client_user_questions'
    ];

    for (const table of tableUpdates) {
      try {
        const result = await prisma.$executeRaw`
          UPDATE ${Prisma.raw(table)} 
          SET tenant_id = ${defaultTenantId}
          WHERE tenant_id IS NULL
        `;
        console.log(`✅ Updated ${table}: ${result} records`);
      } catch (error) {
        console.log(`⚠️ Error updating ${table}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTenantsAndMigrateData();