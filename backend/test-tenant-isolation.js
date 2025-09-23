import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testTenantIsolation() {
  console.log('🔒 Testing Tenant Isolation for Services...\n');
  
  try {
    // Test 1: Login as tenant_001 user and get services
    console.log('📝 Test 1: Login as tenant_001 user (bob@example.com)');
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'bob@example.com',
      password: 'adminpass',  // Correct password
    });
    
    if (!loginResponse.data.successful) {
      console.log('❌ Login failed for bob@example.com');
      return;
    }
    
    const token = loginResponse.data.accessToken;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as ${user.name} (${user.email})`);
    console.log(`   User object:`, JSON.stringify(user, null, 2));
    console.log(`   Tenant: ${user.tenantId || user.tenant_id || 'undefined'}`);
    
    // Use the correct tenant ID field
    const userTenantId = user.tenantId || user.tenant_id;
    
    // Test 2: Get services for tenant_001 user
    console.log('\n📝 Test 2: Get services for tenant_001 user');
    const servicesResponse = await axios.get('http://localhost:5000/services', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': userTenantId,
        'Content-Type': 'application/json'
      }
    });
    
    const services = servicesResponse.data.data;
    console.log(`✅ Retrieved ${services.length} services:`);
      services.forEach(service => {
        console.log(`   - ${service.service_name} (Tenant: ${service.tenant_id})`);
        if (service.tenant_id !== userTenantId) {
          console.log(`❌ SECURITY ISSUE: Service from wrong tenant detected!`);
        }
      });    // Test 3: Try to access a default-tenant service directly
    console.log('\n📝 Test 3: Try to access default-tenant service directly');
    
    // Get a default-tenant service ID
    const defaultServices = await prisma.services.findMany({
      where: { tenant_id: 'default-tenant' },
      take: 1
    });
    
    if (defaultServices.length > 0) {
      const defaultServiceId = defaultServices[0].service_id;
      console.log(`Attempting to access default-tenant service: ${defaultServiceId}`);
      
      try {
        const serviceResponse = await axios.get(`http://localhost:5000/services/${defaultServiceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': userTenantId,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`❌ SECURITY ISSUE: Was able to access cross-tenant service!`);
        console.log(`   Service: ${serviceResponse.data.data.service_name}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`✅ Correctly blocked access to cross-tenant service (404)`);
        } else {
          console.log(`⚠️  Unexpected error: ${error.message}`);
        }
      }
    }
    
    // Test 4: Try to search services (should only return tenant_001 services)
    console.log('\n📝 Test 4: Search services (should only return tenant_001 services)');
    try {
      const searchResponse = await axios.get('http://localhost:5000/services/search/consultation', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': userTenantId,
          'Content-Type': 'application/json'
        }
      });
      
      const searchResults = searchResponse.data.data;
      console.log(`✅ Search returned ${searchResults.length} services:`);
      searchResults.forEach(service => {
        console.log(`   - ${service.service_name} (Tenant: ${service.tenant_id})`);
        if (service.tenant_id !== userTenantId) {
          console.log(`❌ SECURITY ISSUE: Search returned cross-tenant service!`);
        }
      });
    } catch (error) {
      console.log(`⚠️  Search error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n🎯 Tenant Isolation Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTenantIsolation();