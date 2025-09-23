import axios from 'axios';

async function testServiceUpdate() {
  const tenant001Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvYkBleGFtcGxlLmNvbSIsIm5hbWUiOiJCb2IgU2lsdmEiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50X2lkIjoidGVuYW50XzAwMSIsImlhdCI6MTc1ODUyMDE0MiwiZXhwIjoxNzU4NTIzNzQyfQ.Efu0XBU5-V29dWG7AfVmQojWacLxHl1JERilIGkJhUk';
  
  const headers = {
    'Authorization': `Bearer ${tenant001Token}`,
    'X-Tenant-ID': 'tenant_001',
    'Content-Type': 'application/json'
  };

  console.log('🧪 Testing service update functionality...\n');

  // Test 1: Update service_001 (should work - belongs to tenant_001)
  try {
    console.log('1️⃣ Testing update of service_001 (tenant_001 service)...');
    const updateData = {
      service_name: "Updated General Consultation",
      description: "An updated description for testing",
      service_type: "Consultation",
      appointment_fee: 2500,
      is_active: true
    };
    
    const response = await axios.put('http://localhost:5000/services/service_001', updateData, { headers });
    console.log('✅ SUCCESS: Updated service_001');
    console.log(`   - New name: ${response.data.data.service_name}`);
    console.log(`   - New fee: ${response.data.data.appointment_fee}`);
    console.log(`   - Picture: ${response.data.data.picture || 'No picture'}`);
  } catch (error) {
    console.log('❌ UNEXPECTED: Cannot update service_001:', error.response?.status, error.response?.data?.message);
  }

  // Test 2: Try to update service_002 (should fail - belongs to default-tenant)
  try {
    console.log('\n2️⃣ Testing update of service_002 (default-tenant service)...');
    const updateData = {
      service_name: "Hacked Service Name",
      appointment_fee: 99999
    };
    
    const response = await axios.put('http://localhost:5000/services/service_002', updateData, { headers });
    console.log('❌ VIOLATION: tenant_001 user can update service_002 from default-tenant!');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ SUCCESS: Cannot update service_002 (404 Not Found) - Tenant isolation working!');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
    }
  }

  // Test 3: Test toggle status (should work for service_001)
  try {
    console.log('\n3️⃣ Testing toggle status of service_001...');
    const response = await axios.patch('http://localhost:5000/services/service_001/toggle-status', {}, { headers });
    console.log('✅ SUCCESS: Toggled service_001 status');
    console.log(`   - Message: ${response.data.message}`);
    console.log(`   - Active: ${response.data.data.is_active}`);
  } catch (error) {
    console.log('❌ UNEXPECTED: Cannot toggle service_001 status:', error.response?.status, error.response?.data?.message);
  }

  // Test 4: Test toggle status for service_002 (should fail)
  try {
    console.log('\n4️⃣ Testing toggle status of service_002 (should fail)...');
    const response = await axios.patch('http://localhost:5000/services/service_002/toggle-status', {}, { headers });
    console.log('❌ VIOLATION: tenant_001 user can toggle service_002 status!');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ SUCCESS: Cannot toggle service_002 status (404 Not Found) - Tenant isolation working!');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
    }
  }

  console.log('\n🏁 Service update test completed!\n');
}

testServiceUpdate();