import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTenants() {
  try {
    console.log('Checking tenant data...');
    
    // Check services by tenant
    const services = await prisma.services.findMany({
      select: {
        service_id: true,
        service_name: true,
        tenant_id: true
      }
    });
    
    console.log('\n--- Services by Tenant ---');
    const servicesByTenant = {};
    services.forEach(service => {
      if (!servicesByTenant[service.tenant_id]) {
        servicesByTenant[service.tenant_id] = [];
      }
      servicesByTenant[service.tenant_id].push(service.service_name);
    });
    
    Object.keys(servicesByTenant).forEach(tenant => {
      console.log(`\n${tenant}:`);
      servicesByTenant[tenant].forEach(name => console.log(`  - ${name}`));
    });
    
    // Check clients by tenant
    const clients = await prisma.clients.findMany({
      select: {
        email: true,
        name: true,
        tenant_id: true
      }
    });
    
    console.log('\n--- Clients by Tenant ---');
    const clientsByTenant = {};
    clients.forEach(client => {
      if (!clientsByTenant[client.tenant_id]) {
        clientsByTenant[client.tenant_id] = [];
      }
      clientsByTenant[client.tenant_id].push(`${client.name} (${client.email})`);
    });
    
    Object.keys(clientsByTenant).forEach(tenant => {
      console.log(`\n${tenant}:`);
      clientsByTenant[tenant].forEach(name => console.log(`  - ${name}`));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();