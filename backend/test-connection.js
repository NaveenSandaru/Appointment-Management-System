import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const clientCount = await prisma.clients.count();
    console.log(`✅ Found ${clientCount} clients in database`);
    
    const serviceCount = await prisma.services.count();
    console.log(`✅ Found ${serviceCount} services in database`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();