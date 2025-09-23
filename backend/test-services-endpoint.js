import axios from 'axios';

async function testServicesEndpoint() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvYkBleGFtcGxlLmNvbSIsIm5hbWUiOiJCb2IgU2lsdmEiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50X2lkIjoidGVuYW50XzAwMSIsImlhdCI6MTc1ODUyMDE0MiwiZXhwIjoxNzU4NTIzNzQyfQ.Efu0XBU5-V29dWG7AfVmQojWacLxHl1JERilIGkJhUk';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': 'tenant_001',
    'Content-Type': 'application/json'
  };

  try {
    console.log('🔍 Testing authenticated services endpoint for tenant_001...');
    const response = await axios.get('http://localhost:5000/services', { headers });
    console.log('✅ Services response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Services endpoint failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    console.log('\n🔍 Testing public services endpoint...');
    const publicResponse = await axios.get('http://localhost:5000/services/public');
    console.log('✅ Public services response:', JSON.stringify(publicResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Public services endpoint failed:', error.response?.status, error.response?.data || error.message);
  }
}

testServicesEndpoint();