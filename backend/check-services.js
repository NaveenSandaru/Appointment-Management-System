import prisma from './prismaClient.js';

async function checkServices() {
  try {
    console.log('🔍 Checking all services in database:');
    const allServices = await prisma.services.findMany({
      select: {
        service_id: true,
        service_name: true,
        tenant_id: true
      },
      skipTenantEnforcement: true
    });
    
    console.log('📊 All services:');
    allServices.forEach(service => {
      console.log(`  - ID: ${service.service_id}, Name: ${service.service_name}, Tenant: ${service.tenant_id}`);
    });
    
    console.log('\n🏢 Services by tenant:');
    const tenantGroups = {};
    allServices.forEach(service => {
      if (!tenantGroups[service.tenant_id]) {
        tenantGroups[service.tenant_id] = [];
      }
      tenantGroups[service.tenant_id].push(service);
    });
    
    Object.keys(tenantGroups).forEach(tenantId => {
      console.log(`  ${tenantId}:`);
      tenantGroups[tenantId].forEach(service => {
        console.log(`    - ${service.service_name} (ID: ${service.service_id})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();