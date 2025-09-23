import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking existing users...\n');
    
    const clients = await prisma.clients.findMany({
      select: {
        email: true,
        name: true,
        tenant_id: true,
        password: true  // Just to see if password exists
      }
    });
    
    console.log('--- Clients ---');
    clients.forEach(client => {
      console.log(`${client.name} (${client.email})`);
      console.log(`  Tenant: ${client.tenant_id}`);
      console.log(`  Has password: ${client.password ? 'Yes' : 'No'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();