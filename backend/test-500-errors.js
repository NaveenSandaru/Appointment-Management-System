import axios from 'axios';

async function testEndpoints() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvYkBleGFtcGxlLmNvbSIsIm5hbWUiOiJCb2IgU2lsdmEiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50X2lkIjoidGVuYW50XzAwMSIsImlhdCI6MTc1ODUyMDE0MiwiZXhwIjoxNzU4NTIzNzQyfQ.Efu0XBU5-V29dWG7AfVmQojWacLxHl1JERilIGkJhUk';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': 'tenant_001',
    'Content-Type': 'application/json'
  };

  try {
    console.log('🔍 Testing client endpoint...');
    const clientResponse = await axios.get('http://localhost:5000/clients/client/bob@example.com', { headers });
    console.log('✅ Client endpoint successful:', clientResponse.data);
  } catch (error) {
    console.log('❌ Client endpoint failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    console.log('🔍 Testing appointments endpoint...');
    const appointmentResponse = await axios.get('http://localhost:5000/appointments/client/bob@example.com', { headers });
    console.log('✅ Appointments endpoint successful:', appointmentResponse.data);
  } catch (error) {
    console.log('❌ Appointments endpoint failed:', error.response?.status, error.response?.data || error.message);
  }
}

testEndpoints();