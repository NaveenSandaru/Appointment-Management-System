#!/usr/bin/env node

// Script to setup initial tenants and migrate existing data
import prisma from '../prismaClient.js';

async function setupTenantsAndMigrateData() {
  console.log('🔄 Setting up tenants and migrating existing data...\n');

  try {
    // First, let's check what data exists
    console.log('📊 Checking existing data...');
    
    const clientsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM clients`;
    const adminsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM admins`;
    
    console.log(`Found ${clientsCount[0].count} clients and ${adminsCount[0].count} admins`);

    // Create default tenant if it doesn't exist
    console.log('\n🏢 Creating default tenant...');
    
    try {
      await prisma.$queryRaw`
        INSERT INTO tenants (tenant_id, name, display_name, domain, is_active, created_at, updated_at)
        VALUES ('default-tenant', 'Default Organization', 'Default Organization', 'default.com', true, NOW(), NOW())
        ON CONFLICT (tenant_id) DO NOTHING
      `;
      console.log('✅ Default tenant created/exists');
    } catch (error) {
      console.log('⚠️ Tenant creation error:', error.message);
    }

    // Update existing clients to have default tenant
    console.log('\n👥 Updating existing clients with default tenant...');
    
    const updatedClientsResult = await prisma.$queryRaw`
      UPDATE clients 
      SET tenant_id = 'default-tenant' 
      WHERE tenant_id IS NULL
    `;
    console.log(`✅ Updated clients: ${updatedClientsResult.count || 0}`);

    // Update existing admins to have default tenant
    console.log('\n👨‍💼 Updating existing admins with default tenant...');
    
    const updatedAdminsResult = await prisma.$queryRaw`
      UPDATE admins 
      SET tenant_id = 'default-tenant' 
      WHERE tenant_id IS NULL
    `;
    console.log(`✅ Updated admins: ${updatedAdminsResult.count || 0}`);

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
        const result = await prisma.$queryRaw`
          UPDATE ${table} 
          SET tenant_id = 'default-tenant' 
          WHERE tenant_id IS NULL
        `;
        console.log(`✅ Updated ${table}: ${result.count || 0} records`);
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