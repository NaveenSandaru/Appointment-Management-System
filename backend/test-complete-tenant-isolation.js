import axios from 'axios';

async function testTenantIsolation() {
  const tenant001Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvYkBleGFtcGxlLmNvbSIsIm5hbWUiOiJCb2IgU2lsdmEiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50X2lkIjoidGVuYW50XzAwMSIsImlhdCI6MTc1ODUyMDE0MiwiZXhwIjoxNzU4NTIzNzQyfQ.Efu0XBU5-V29dWG7AfVmQojWacLxHl1JERilIGkJhUk';
  
  const tenant001Headers = {
    'Authorization': `Bearer ${tenant001Token}`,
    'X-Tenant-ID': 'tenant_001',
    'Content-Type': 'application/json'
  };

  console.log('🧪 Testing tenant isolation for tenant_001 user...\n');

  // Test 1: Authenticated services endpoint should return only tenant_001 services
  try {
    console.log('1️⃣ Testing authenticated /services endpoint...');
    const servicesResponse = await axios.get('http://localhost:5000/services', { headers: tenant001Headers });
    const services = servicesResponse.data.data;
    
    console.log(`   📊 Found ${services.length} service(s):`);
    services.forEach(service => {
      console.log(`   - ${service.service_name} (${service.service_id}) - Tenant: ${service.tenant_id}`);
    });
    
    const hasOnlyTenant001Services = services.every(service => service.tenant_id === 'tenant_001');
    console.log(`   ✅ All services belong to tenant_001: ${hasOnlyTenant001Services}`);
    
    if (!hasOnlyTenant001Services) {
      console.log('   ❌ VIOLATION: tenant_001 user can see services from other tenants!');
    }
  } catch (error) {
    console.log('   ❌ Error testing services:', error.response?.status, error.response?.data?.message);
  }

  // Test 2: Try to access service_001 (should work - belongs to tenant_001)
  try {
    console.log('\n2️⃣ Testing access to service_001 (tenant_001 service)...');
    const service001Response = await axios.get('http://localhost:5000/services/service_001', { headers: tenant001Headers });
    console.log(`   ✅ SUCCESS: Can access service_001 - ${service001Response.data.data.service_name}`);
  } catch (error) {
    console.log('   ❌ UNEXPECTED: Cannot access service_001:', error.response?.status, error.response?.data?.message);
  }

  // Test 3: Try to access service_002 (should fail - belongs to default-tenant)
  try {
    console.log('\n3️⃣ Testing access to service_002 (default-tenant service)...');
    const service002Response = await axios.get('http://localhost:5000/services/service_002', { headers: tenant001Headers });
    console.log('   ❌ VIOLATION: tenant_001 user can access service_002 from default-tenant!');
    console.log(`   - Service: ${service002Response.data.data.service_name}`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ SUCCESS: Cannot access service_002 (404 Not Found) - Tenant isolation working!');
    } else {
      console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data?.message);
    }
  }

  // Test 4: Public services endpoint (should show only default-tenant services)
  try {
    console.log('\n4️⃣ Testing public /services/public endpoint...');
    const publicResponse = await axios.get('http://localhost:5000/services/public');
    const publicServices = publicResponse.data.data;
    
    console.log(`   📊 Found ${publicServices.length} public service(s):`);
    publicServices.forEach(service => {
      console.log(`   - ${service.service_name} (${service.service_id}) - Tenant: ${service.tenant_id}`);
    });
    
    const hasOnlyDefaultServices = publicServices.every(service => service.tenant_id === 'default-tenant');
    console.log(`   ✅ All public services belong to default-tenant: ${hasOnlyDefaultServices}`);
  } catch (error) {
    console.log('   ❌ Error testing public services:', error.response?.status, error.response?.data?.message);
  }

  console.log('\n🏁 Tenant isolation test completed!\n');
}

testTenantIsolation();